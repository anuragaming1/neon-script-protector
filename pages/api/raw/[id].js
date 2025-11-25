// pages/api/raw/[id].js
const { getScript } = require('../../../../lib/storage');

export default async function handler(req, res) {
  const { id } = req.query;

  // Cho phép CORS
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
    // Lấy script từ storage
    const script = getScript(id);
    
    if (!script) {
      return res.status(404).json({ 
        error: 'Script not found',
        message: `Script với ID "${id}" không tồn tại. Vui lòng tạo script mới.`
      });
    }

    // PHÂN BIỆT THẬT/GIẢ - LUÔN trả về thật cho executor
    const isExecutor = true; // Luôn trả về script thật

    const scriptContent = isExecutor ? script.realScript : script.fakeScript;

    // Set headers
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    
    console.log(`🎯 Serving script: ${id}`);
    
    return res.send(scriptContent);
    
  } catch (error) {
    console.error('Error serving script:', error);
    return res.status(500).json({ 
      error: 'Internal server error'
    });
  }
}
