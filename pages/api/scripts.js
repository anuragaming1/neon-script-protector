// pages/api/scripts.js
const { saveScript } = require('../../../lib/storage');

export default async function handler(req, res) {
  // CORS headers - QUAN TRỌNG cho executor
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, User-Agent, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

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

      // Lưu script vào storage
      const saved = saveScript(id, repoName, realScript, fakeScript);
      
      if (!saved) {
        return res.status(500).json({ 
          success: false,
          error: 'Không thể lưu script'
        });
      }

      // Tạo URL - QUAN TRỌNG: Thêm parameter cho executor
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';

      const scriptUrl = `${baseUrl}/api/raw/${id}`;
      const executorUrl = `${scriptUrl}?source=roblox`;
      
      console.log(`🚀 Created script: ${id}`);
      console.log(`🔗 URL: ${scriptUrl}`);
      console.log(`🎮 Executor URL: ${executorUrl}`);
      
      return res.status(200).json({ 
        success: true,
        id,
        url: scriptUrl,
        executorUrl: executorUrl,
        message: 'Tạo script thành công!'
      });
      
    } catch (error) {
      console.error('❌ Error creating script:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Lỗi server: ' + error.message 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
        }
