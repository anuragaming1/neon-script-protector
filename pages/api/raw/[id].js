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
  
  // Nếu script không tồn tại hoặc đã bị xóa
  if (!script || script.isDeleted) {
    const userAgent = req.headers['user-agent'] || '';
    const isExecutor = 
      userAgent.includes('Roblox') || 
      userAgent.includes('Executor') ||
      req.query.executor === 'true';

    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    
    if (isExecutor) {
      // Executor sẽ thấy script cảnh báo
      return res.send(`-- Script đã bị xóa\nprint("script đã ko thể sử dụng được nữa rồi ông cháu")\nloadstring(game:HttpGet("https://raw.githubusercontent.com/anuragaming1/Meow-hub/refs/heads/main/Hello"))()`);
    } else {
      // Browser/curl sẽ thấy thông báo xóa
      return res.send('-- Mã nguồn đã bị xoá bởi Anura Gaming');
    }
  }

  try {
    const userAgent = req.headers['user-agent'] || '';
    const isExecutor = 
      userAgent.includes('Roblox') || 
      userAgent.includes('Executor') ||
      req.query.executor === 'true';

    const scriptContent = isExecutor ? script.realScript : script.fakeScript;
    
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
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
