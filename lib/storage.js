// lib/storage.js
const fs = require('fs');
const path = require('path');

const dataDir = path.join(process.cwd(), 'data');
const dataFile = path.join(dataDir, 'scripts.json');

// Đảm bảo thư mục data tồn tại
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
    console.error('Error reading scripts:', error);
  }
  return {};
}

// Ghi scripts vào file
function writeScripts(scripts) {
  try {
    ensureDataDir();
    fs.writeFileSync(dataFile, JSON.stringify(scripts, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing scripts:', error);
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
    createdAt: new Date().toISOString()
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
    console.log(`✅ Found script: ${id}`);
  } else {
    console.log(`❌ Script not found: ${id}`);
  }
  
  return script || null;
}

// Lấy tất cả scripts (cho debug)
function getAllScripts() {
  return readScripts();
}

module.exports = {
  saveScript,
  getScript,
  getAllScripts
};
