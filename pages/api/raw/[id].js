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
    
    // CÁCH MỚI: Luôn trả về script thật cho tất cả request
    // Vì các executor thường không gửi header đặc biệt
    const isExecutor = true; // Luôn trả về script thật
    
    // HOẶC: Detect đơn giản hơn - nếu có query parameter 'executor'
    // const isExecutor = req.query.executor === 'true' || true;
    
    const scriptContent = isExecutor ? script.realScript : script.fakeScript;
    
    // QUAN TRỌNG: Set content type cho Luau code
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('X-Script-ID', id);
    
    console.log(`Serving script ${id} for executor: ${isExecutor}`);
    
    return res.send(scriptContent);
    
  } catch (error) {
    console.error('Error serving script:', error);
    return res.status(500).json({ 
      error: 'Internal server error'
    });
  }
}
