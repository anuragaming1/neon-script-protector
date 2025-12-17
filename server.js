const express = require('express');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Thư mục lưu trữ
const SCRIPTS_DIR = path.join(__dirname, 'scripts');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Đảm bảo thư mục tồn tại
fs.ensureDirSync(SCRIPTS_DIR);
fs.ensureDirSync(UPLOADS_DIR);

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

// Middleware kiểm tra đăng nhập
const requireLogin = (req, res, next) => {
  const { username, password } = req.body;
  
  if (username === process.env.USERNAME && password === process.env.PASSWORD) {
    next();
  } else {
    res.status(401).json({ error: 'Sai tên đăng nhập hoặc mật khẩu' });
  }
};

// API đăng nhập
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === process.env.USERNAME && password === process.env.PASSWORD) {
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

// API tạo script
app.post('/api/scripts', requireLogin, upload.fields([
  { name: 'realScript', maxCount: 1 },
  { name: 'fakeScript', maxCount: 1 }
]), async (req, res) => {
  try {
    const { repoName } = req.body;
    const realFile = req.files?.realScript?.[0];
    const fakeFile = req.files?.fakeScript?.[0];

    if (!repoName) {
      return res.status(400).json({ error: 'Vui lòng nhập tên repository' });
    }

    // Đọc nội dung file hoặc text
    let realContent = '';
    let fakeContent = '';

    if (realFile) {
      realContent = await fs.readFile(realFile.path, 'utf8');
      await fs.remove(realFile.path); // Xóa file tạm sau khi đọc
    } else if (req.body.realText) {
      realContent = req.body.realText;
    } else {
      return res.status(400).json({ error: 'Vui lòng nhập script thật' });
    }

    if (fakeFile) {
      fakeContent = await fs.readFile(fakeFile.path, 'utf8');
      await fs.remove(fakeFile.path);
    } else if (req.body.fakeText) {
      fakeContent = req.body.fakeText;
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

    await fs.writeJson(path.join(SCRIPTS_DIR, `${id}.json`), scriptData);
    
    // Tạo URLs
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
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// API lấy raw script (QUAN TRỌNG: hoạt động với Roblox executor)
app.get('/raw/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { executor } = req.query;
    
    const scriptPath = path.join(SCRIPTS_DIR, `${id}.json`);
    
    if (!await fs.pathExists(scriptPath)) {
      return res.status(404).json({ error: 'Script not found' });
    }

    const scriptData = await fs.readJson(scriptPath);
    
    // Phân biệt script thật/giả
    const content = executor === 'true' ? scriptData.realContent : scriptData.fakeContent;
    
    // Set headers cho Roblox executor
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    res.send(content);
    
  } catch (error) {
    console.error('Error serving script:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API xóa script
app.delete('/api/scripts/:id', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;
    const scriptPath = path.join(SCRIPTS_DIR, `${id}.json`);
    
    if (await fs.pathExists(scriptPath)) {
      await fs.remove(scriptPath);
      res.json({ success: true, message: 'Đã xóa script' });
    } else {
      res.status(404).json({ error: 'Script không tồn tại' });
    }
  } catch (error) {
    console.error('Error deleting script:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// API lấy danh sách scripts (chỉ admin)
app.get('/api/scripts', requireLogin, async (req, res) => {
  try {
    const files = await fs.readdir(SCRIPTS_DIR);
    const scripts = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const scriptData = await fs.readJson(path.join(SCRIPTS_DIR, file));
        scripts.push({
          id: scriptData.id,
          repoName: scriptData.repoName,
          createdAt: scriptData.createdAt
        });
      }
    }
    
    res.json({ success: true, scripts });
  } catch (error) {
    console.error('Error listing scripts:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Route cho frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`🚀 Server chạy trên port ${PORT}`);
  console.log(`🌐 Truy cập: http://localhost:${PORT}`);
});
