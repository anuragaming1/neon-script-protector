// pages/api/raw/[id].js
const { getScript } = require('../../../../lib/database');

export default async function handler(req, res) {
  const { id } = req.query;

  // Cho phép CORS - QUAN TRỌNG để tránh lỗi 401
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed' 
    });
  }

  try {
    // Lấy script từ database
    const script = getScript(id);
    
    if (!script) {
      return res.status(404).json({ 
        error: 'Script not found',
        message: `Script với ID "${id}" không tồn tại.`
      });
    }

    // LUÔN trả về script thật cho tất cả request
    // Để đảm bảo executor nào cũng chạy được
    const scriptContent = script.realScript;

    // Set headers cho Luau code
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache 1 năm
    
    console.log(`Serving script: ${id}`);
    
    return res.send(scriptContent);
    
  } catch (error) {
    console.error('Error serving script:', error);
    return res.status(500).json({ 
      error: 'Internal server error'
    });
  }
}
