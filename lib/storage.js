// lib/storage.js
const fs = require('fs');
const path = require('path');

// Sử dụng thư mục /tmp trên Vercel (có quyền ghi)
const dataFile = '/tmp/scripts.json';

// Đảm bảo file tồn tại
function ensureDataFile() {
  try {
    if (!fs.existsSync(dataFile)) {
      fs.writeFileSync(dataFile, '{}');
      console.log('✅ Created data file:', dataFile);
    }
    return true;
  } catch (error) {
    console.error('❌ Error creating data file:', error);
    return false;
  }
}

// Đọc tất cả scripts
function readScripts() {
  try {
    ensureDataFile();
    const data = fs.readFileSync(dataFile, 'utf8');
    const scripts = JSON.parse(data);
    console.log(`📖 Read ${Object.keys(scripts).length} scripts from storage`);
    return scripts;
  } catch (error) {
    console.error('❌ Error reading scripts:', error);
    return {};
  }
}

// Ghi scripts vào file
function writeScripts(scripts) {
  try {
    ensureDataFile();
    fs.writeFileSync(dataFile, JSON.stringify(scripts, null, 2));
    console.log(`💾 Saved ${Object.keys(scripts).length} scripts to storage`);
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
    createdAt: new Date().toISOString()
  };
  
  const success = writeScripts(scripts);
  if (success) {
    console.log(`✅ Script saved: ${id}`);
    console.log(`📊 Total scripts: ${Object.keys(scripts).length}`);
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
    console.log(`📋 Available scripts: ${Object.keys(scripts).join(', ') || 'None'}`);
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
