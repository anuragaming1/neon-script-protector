const express = require('express');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// TẠO THƯ MỤC NẾU CHƯA CÓ (trên Vercel)
const SCRIPTS_DIR = '/tmp/scripts';
const UPLOADS_DIR = '/tmp/uploads';

// Đảm bảo thư mục tồn tại
try {
  if (!fs.existsSync(SCRIPTS_DIR)) {
    fs.mkdirSync(SCRIPTS_DIR, { recursive: true });
    console.log('✅ Created scripts directory:', SCRIPTS_DIR);
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    console.log('✅ Created uploads directory:', UPLOADS_DIR);
  }
} catch (err) {
  console.error('❌ Error creating directories:', err);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // Serve static files từ root

// Cấu hình multer cho upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.lua', '.luau', '.txt', '.xml', '.json', '.py', '.js', '.css', '.html'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Loại file không được hỗ trợ'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// BIẾN MÔI TRƯỜNG
const VALID_USERNAME = process.env.USERNAME || "Anura123";
const VALID_PASSWORD = process.env.PASSWORD || "Anura123";

// Middleware kiểm tra đăng nhập
const requireLogin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const { username, password } = req.body;
  
  // Kiểm tra qua body hoặc header
  const isAuthenticated = 
    (username === VALID_USERNAME && password === VALID_PASSWORD) ||
    (authHeader === 'Bearer authenticated');
  
  if (isAuthenticated) {
    next();
  } else {
    res.status(401).json({ 
      success: false, 
      error: 'Sai tên đăng nhập hoặc mật khẩu' 
    });
  }
};

// API đăng nhập
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === VALID_USERNAME && password === VALID_PASSWORD) {
    res.json({ 
      success: true, 
      message: 'Đăng nhập thành công',
      token: 'authenticated'
    });
  } else {
    res.status(401).json({ 
      success: false, 
      error: 'Sai tên đăng nhập hoặc mật khẩu' 
    });
  }
});

// API tạo script - SIMPLIFIED
app.post('/api/scripts', upload.fields([
  { name: 'realScript', maxCount: 1 },
  { name: 'fakeScript', maxCount: 1 }
]), async (req, res) => {
  try {
    const { repoName, realText, fakeText, username, password } = req.body;
    
    // Kiểm tra đăng nhập
    if (username !== VALID_USERNAME || password !== VALID_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!repoName) {
      return res.status(400).json({ error: 'Vui lòng nhập tên repository' });
    }

    // Đọc nội dung file hoặc text
    let realContent = '';
    let fakeContent = '';

    const realFile = req.files?.realScript?.[0];
    const fakeFile = req.files?.fakeScript?.[0];

    if (realFile) {
      realContent = await fs.readFile(realFile.path, 'utf8');
      await fs.remove(realFile.path);
    } else if (realText) {
      realContent = realText;
    } else {
      return res.status(400).json({ error: 'Vui lòng nhập script thật' });
    }

    if (fakeFile) {
      fakeContent = await fs.readFile(fakeFile.path, 'utf8');
      await fs.remove(fakeFile.path);
    } else if (fakeText) {
      fakeContent = fakeText;
    } else {
      return res.status(400).json({ error: 'Vui lòng nhập script giả' });
    }

    // Tạo ID ngẫu nhiên
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
    
    // Lưu script vào file
    const scriptData = {
      id,
      repoName,
      realContent,
      fakeContent,
      createdAt: new Date().toISOString()
    };

    const scriptPath = path.join(SCRIPTS_DIR, `${id}.json`);
    await fs.writeJson(scriptPath, scriptData);
    
    // Tạo URLs - QUAN TRỌNG: dùng process.env.VERCEL_URL
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : `http://localhost:${PORT}`;

    const urls = {
      executor: `${baseUrl}/raw/${id}?executor=true`,
      fake: `${baseUrl}/raw/${id}`,
      raw: `${baseUrl}/raw/${id}`
    };

    res.json({
      success: true,
      id,
      urls,
      message: 'Tạo script thành công!'
    });

  } catch (error) {
    console.error('Error creating script:', error);
    res.status(500).json({ error: 'Lỗi server: ' + error.message });
  }
});

// API lấy raw script - SIMPLIFIED (luôn hoạt động với executor)
app.get('/raw/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { executor } = req.query;
    
    const scriptPath = path.join(SCRIPTS_DIR, `${id}.json`);
    
    if (!fs.existsSync(scriptPath)) {
      // Trả về luôn plain text để executor không bị lỗi JSON parse
      return res.status(404).send('Script not found');
    }

    const scriptData = await fs.readJson(scriptPath);
    
    // LUÔN trả về script thật cho executor
    const content = executor === 'true' ? scriptData.realContent : scriptData.fakeContent;
    
    // Set headers cho Roblox executor
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    res.send(content);
    
  } catch (error) {
    console.error('Error serving script:', error);
    res.status(500).send('Internal server error');
  }
});

// Route cho frontend - SIMPLE
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Neon Script Protector</title>
      <meta http-equiv="refresh" content="0; url=/index.html">
    </head>
    <body>
      <p>Redirecting to Neon Script Protector...</p>
    </body>
    </html>
  `);
});

// Khởi động server - QUAN TRỌNG
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  🚀 Server đang chạy!
  📍 Port: ${PORT}
  🔗 Local: http://localhost:${PORT}
  📂 Scripts dir: ${SCRIPTS_DIR}
  👤 Username: ${VALID_USERNAME}
  `);
});
