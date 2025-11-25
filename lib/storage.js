// lib/storage.js

// Sử dụng global để lưu scripts
if (typeof global.scripts === 'undefined') {
  global.scripts = new Map();
  console.log('📦 Initialized global scripts storage');
}

const scripts = global.scripts;

// Lưu script
function saveScript(id, repoName, realScript, fakeScript) {
  scripts.set(id, {
    id,
    repoName,
    realScript,
    fakeScript,
    createdAt: new Date().toISOString()
  });
  
  console.log(`💾 Script saved: ${id}`);
  console.log(`📊 Total scripts: ${scripts.size}`);
  
  return true;
}

// Lấy script
function getScript(id) {
  const script = scripts.get(id);
  
  if (script) {
    console.log(`✅ Found script: ${id}`);
  } else {
    console.log(`❌ Script not found: ${id}`);
    console.log(`📋 Available scripts: ${Array.from(scripts.keys()).join(', ') || 'None'}`);
  }
  
  return script || null;
}

module.exports = {
  saveScript,
  getScript
};
