// lib/storage.js
const fs = require('fs');
const path = require('path');
const os = require('os');

// Sử dụng /tmp directory trên Vercel
const dataDir = process.env.NODE_ENV === 'production' 
  ? '/tmp' 
  : path.join(process.cwd(), 'data');
const dataFile = path.join(dataDir, 'scripts.json');

// Đảm bảo thư mục tồn tại
function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Đọc tất cả scripts
function readScripts() {
  try {
    ensureDataDir();
    if (fs.existsSync(dataFile)) {
      const data = fs.readFileSync(dataFile, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('❌ Error reading scripts:', error);
  }
  return {};
}

// Ghi scripts vào file
function writeScripts(scripts) {
  try {
    ensureDataDir();
    fs.writeFileSync(dataFile, JSON.stringify(scripts, null, 2));
    console.log(`💾 Saved ${Object.keys(scripts).length} scripts to ${dataFile}`);
    return true;
  } catch (error) {
    console.error('❌ Error writing scripts:', error);
    return false;
  }
}

// Lưu script mới
function saveScript(id, repoName, realScript, fakeScript) {
  const scripts = readScripts();
  scripts[id] = {
    id,
    repoName,
    realScript,
    fakeScript,
    createdAt: new Date().toISOString(),
    lastAccessed: new Date().toISOString()
  };
  
  const success = writeScripts(scripts);
  if (success) {
    console.log(`✅ Script saved: ${id}`);
  }
  return success;
}

// Lấy script theo ID
function getScript(id) {
  const scripts = readScripts();
  const script = scripts[id];
  
  if (script) {
    // Update last accessed time
    script.lastAccessed = new Date().toISOString();
    scripts[id] = script;
    writeScripts(scripts);
    
    console.log(`✅ Found script: ${id}`);
    console.log(`📊 Total scripts: ${Object.keys(scripts).length}`);
  } else {
    console.log(`❌ Script not found: ${id}`);
    console.log(`📋 Available IDs: ${Object.keys(scripts).join(', ') || 'None'}`);
  }
  
  return script || null;
}

// Lấy tất cả scripts (cho debug)
function getAllScripts() {
  const scripts = readScripts();
  console.log(`📦 Total scripts in storage: ${Object.keys(scripts).length}`);
  return scripts;
}

// Xóa script cũ (30 ngày)
function cleanupOldScripts() {
  const scripts = readScripts();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  
  let deletedCount = 0;
  Object.keys(scripts).forEach(id => {
    const lastAccessed = new Date(scripts[id].lastAccessed);
    if (lastAccessed < thirtyDaysAgo) {
      delete scripts[id];
      deletedCount++;
    }
  });
  
  if (deletedCount > 0) {
    writeScripts(scripts);
    console.log(`🧹 Cleaned up ${deletedCount} old scripts`);
  }
}

// Tự động cleanup mỗi lần khởi động
cleanupOldScripts();

module.exports = {
  saveScript,
  getScript,
  getAllScripts
};
