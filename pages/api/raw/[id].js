// pages/api/raw/[id].js
import { scripts } from '../scripts';

export default function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed' 
    });
  }

  const script = scripts.get(id);
  if (!script) {
    return res.status(404).json({ 
      error: 'Script not found'
    });
  }

  try {
    const userAgent = req.headers['user-agent'] || '';
    
    // Detect executor - hỗ trợ cả Roblox Luau
    const isExecutor = 
      userAgent.includes('Roblox') || 
      userAgent.includes('Executor') ||
      userAgent.includes('Luau') ||
      req.headers['x-roblox-id'] ||
      req.headers['x-requested-with'] === 'XMLHttpRequest' ||
      req.query.executor === 'true' ||
      req.query.source === 'executor';

    const scriptContent = isExecutor ? script.realScript : script.fakeScript;
    
    // Set content type cho Luau/Lua
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('X-Script-ID', id);
    res.setHeader('X-Script-Type', isExecutor ? 'real' : 'fake');
    
    return res.send(scriptContent);
    
  } catch (error) {
    console.error('Error serving script:', error);
    return res.status(500).json({ 
      error: 'Internal server error'
    });
  }
}
