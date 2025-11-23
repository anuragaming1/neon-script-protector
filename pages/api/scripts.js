// pages/api/scripts.js

// Lưu trữ script trong memory
const scripts = new Map();

export default function handler(req, res) {
  // Chỉ cho phép POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed. Only POST requests are accepted.' 
    });
  }

  try {
    const { repoName, realScript, fakeScript } = req.body;
    
    // Validate input
    if (!repoName || !realScript || !fakeScript) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields',
        required: ['repoName', 'realScript', 'fakeScript']
      });
    }

    // Tạo ID ngẫu nhiên
    const id = Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);

    // Lưu script
    scripts.set(id, {
      id,
      repoName,
      realScript,
      fakeScript,
      createdAt: new Date().toISOString()
    });

    console.log('Script created with ID:', id);

    // Trả về URL
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    const scriptUrl = `${baseUrl}/api/raw/${id}`;
    
    return res.status(200).json({ 
      success: true,
      id,
      url: scriptUrl,
      message: 'Script created successfully'
    });
    
  } catch (error) {
    console.error('Error creating script:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error: ' + error.message 
    });
  }
}

// Export scripts để sử dụng trong file khác
export { scripts };
