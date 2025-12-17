// pages/api/raw/[id].js
const { getScript } = require('../../../../lib/storage');

export default async function handler(req, res) {
  const { id } = req.query;

  // CORS headers - ROBLOX EXECUTOR CẦN CÁI NÀY
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Expose-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed' 
    });
  }

  try {
    // Lấy script từ storage
    const script = getScript(id);
    
    if (!script) {
      console.log(`❌ Script ${id} not found`);
      // Trả về 404 với plain text để executor hiểu
      res.setHeader('Content-Type', 'text/plain');
      return res.status(404).send(`Script with ID "${id}" not found. Please create a new script.`);
    }

    // LOG để debug
    console.log('=== ROBLOX EXECUTOR REQUEST ===');
    console.log('Script ID:', id);
    console.log('User-Agent:', req.headers['user-agent'] || 'No User-Agent');
    console.log('Headers:', req.headers);
    console.log('Query params:', req.query);
    console.log('===============================');

    // PHÂN BIỆT THẬT/GIẢ - ROBLOX EXECUTOR DETECTION
    const userAgent = (req.headers['user-agent'] || '').toLowerCase();
    const referer = req.headers['referer'] || '';
    const origin = req.headers['origin'] || '';
    
    // Các cách phát hiện executor
    const isRobloxExecutor = 
      // Query parameter
      req.query.source === 'roblox' ||
      req.query.executor === 'true' ||
      req.query.roblox === 'true' ||
      // User-Agent patterns
      userAgent.includes('roblox') ||
      userAgent.includes('executor') ||
      userAgent.includes('synapse') ||
      userAgent.includes('krnl') ||
      userAgent.includes('fluxus') ||
      userAgent.includes('delta') ||
      userAgent.includes('script-ware') ||
      // Headers đặc biệt
      req.headers['x-roblox-id'] ||
      req.headers['x-requested-with'] === 'XMLHttpRequest' ||
      // Referer/Origin từ Roblox
      referer.includes('roblox') ||
      origin.includes('roblox') ||
      // Luôn trả về thật nếu có parameter đặc biệt
      req.query._executor ||
      req.query._real;

    console.log(`🎯 Detected as ${isRobloxExecutor ? 'ROBLOX EXECUTOR' : 'BROWSER/OTHER'}`);
    
    // Chọn script content
    const scriptContent = isRobloxExecutor ? script.realScript : script.fakeScript;
    
    // HEADERS CHUẨN CHO ROBLOX EXECUTOR
    // QUAN TRỌNG: Content-Type phải là text/plain
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Roblox-Script-ID', id);
    res.setHeader('X-Script-Type', isRobloxExecutor ? 'real' : 'fake');
    
    console.log(`📤 Sending ${isRobloxExecutor ? 'REAL' : 'FAKE'} script (${scriptContent.length} chars)`);
    
    // Trả về script content
    return res.send(scriptContent);
    
  } catch (error) {
    console.error('❌ Error serving script:', error);
    res.setHeader('Content-Type', 'text/plain');
    return res.status(500).send('Internal server error: ' + error.message);
  }
}
