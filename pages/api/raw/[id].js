// pages/api/raw/[id].js
import { scripts } from '../scripts';

export default function handler(req, res) {
  const { id } = req.query;

  // Chỉ cho phép GET request
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed. Only GET requests are accepted.' 
    });
  }

  // Kiểm tra script có tồn tại không
  const script = scripts.get(id);
  if (!script) {
    return res.status(404).json({ 
      error: 'Script not found',
      message: `Script với ID "${id}" không tồn tại.`
    });
  }

  try {
    // Xác định user-agent để trả về script thật hoặc giả
    const userAgent = req.headers['user-agent'] || '';
    
    // Kiểm tra nếu là executor (Roblox, hoặc có query parameter)
    const isExecutor = 
      userAgent.includes('Roblox') || 
      userAgent.includes('Executor') ||
      req.headers['x-roblox-id'] ||
      req.headers['x-requested-with'] === 'XMLHttpRequest' ||
      req.query.executor === 'true' ||
      req.query.source === 'executor';

    console.log('User-Agent:', userAgent);
    console.log('Is Executor:', isExecutor);
    console.log('Script ID:', id);

    // Trả về script tương ứng
    const scriptContent = isExecutor ? script.realScript : script.fakeScript;
    
    // Set headers cho JavaScript
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache 1 giờ
    res.setHeader('X-Script-ID', id);
    res.setHeader('X-Script-Type', isExecutor ? 'real' : 'fake');
    
    return res.send(scriptContent);
    
  } catch (error) {
    console.error('Error serving script:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
