// pages/api/scripts.js
const { saveScript } = require('../../lib/storage');

export default async function handler(req, res) {
  // Cho phép CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { repoName, realScript, fakeScript } = req.body;

      // Validate input
      if (!repoName || !realScript || !fakeScript) {
        return res.status(400).json({ 
          success: false,
          error: 'Vui lòng điền đầy đủ thông tin'
        });
      }

      // Tạo ID ngẫu nhiên
      const id = Math.random().toString(36).substring(2, 15) + 
                 Math.random().toString(36).substring(2, 15);

      // Lưu script vào file JSON
      const saved = saveScript(id, repoName, realScript, fakeScript);
      
      if (!saved) {
        return res.status(500).json({ 
          success: false,
          error: 'Không thể lưu script'
        });
      }

      // Tạo URL
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';

      const scriptUrl = `${baseUrl}/api/raw/${id}`;
      
      return res.status(200).json({ 
        success: true,
        id,
        url: scriptUrl,
        message: 'Tạo script thành công!'
      });
      
    } catch (error) {
      console.error('Error creating script:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Lỗi server' 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
