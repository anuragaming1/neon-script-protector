// lib/database.js
const sqlite3 = require('better-sqlite3');
const path = require('path');

// Tạo database trong memory (hoặc file nếu cần)
let db;

function initDatabase() {
  if (!db) {
    // Sử dụng database trong memory
    db = new sqlite3(':memory:');
    
    // Tạo table
    db.exec(`
      CREATE TABLE IF NOT EXISTS scripts (
        id TEXT PRIMARY KEY,
        repoName TEXT NOT NULL,
        realScript TEXT NOT NULL,
        fakeScript TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Database initialized');
  }
  return db;
}

// Hàm lưu script
function saveScript(id, repoName, realScript, fakeScript) {
  const db = initDatabase();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO scripts (id, repoName, realScript, fakeScript)
    VALUES (?, ?, ?, ?)
  `);
  
  return stmt.run(id, repoName, realScript, fakeScript);
}

// Hàm lấy script
function getScript(id) {
  const db = initDatabase();
  const stmt = db.prepare('SELECT * FROM scripts WHERE id = ?');
  return stmt.get(id);
}

// Hàm lấy tất cả scripts (cho quản lý)
function getAllScripts() {
  const db = initDatabase();
  const stmt = db.prepare('SELECT * FROM scripts ORDER BY createdAt DESC');
  return stmt.all();
}

// Hàm xóa script
function deleteScript(id) {
  const db = initDatabase();
  const stmt = db.prepare('DELETE FROM scripts WHERE id = ?');
  return stmt.run(id);
}

module.exports = {
  initDatabase,
  saveScript,
  getScript,
  getAllScripts,
  deleteScript
};
