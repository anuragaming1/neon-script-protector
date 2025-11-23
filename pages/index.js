import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
// Biến toàn cục để lưu scripts (trong production dùng database)
if (typeof global.scripts === 'undefined') {
  global.scripts = new Map();
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  const [formData, setFormData] = useState({
    repoName: '',
    realScript: '',
    fakeScript: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState(false);

  const VALID_USERNAME = "Anura123";
  const VALID_PASSWORD = "Anura123";

  const handleLogin = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      setIsLoggedIn(true);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/scripts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data);
      } else {
        alert('Có lỗi xảy ra khi tạo script: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Lỗi kết nối! Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Đã copy URL vào clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  if (!isLoggedIn) {
    return (
      <>
        <Head>
          <title>Neon Script Protector - Đăng Nhập</title>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>
        <div className="container">
          <div className="logo">NEON SCRIPT PROTECTOR</div>
          <h1>Đăng Nhập</h1>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="username">Tên đăng nhập</label>
              <input 
                type="text" 
                id="username" 
                name="username" 
                placeholder="Nhập tên đăng nhập"
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                placeholder="Nhập mật khẩu"
                required 
              />
            </div>
            <button type="submit" className="btn btn-primary">Đăng Nhập</button>
            {loginError && (
              <div className="error-message">
                Tên đăng nhập hoặc mật khẩu không đúng!
              </div>
            )}
          </form>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Neon Script Protector</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      <div className="container">
        <div className="logo">NEON SCRIPT PROTECTOR</div>
        <h1>Tạo Script Bảo Mật</h1>
        
        <div className="tab-container">
          <div 
            className={`tab ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            Tạo Script
          </div>
          <div 
            className={`tab ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            Quản Lý
          </div>
        </div>
        
        {activeTab === 'create' && (
          <form onSubmit={handleGenerate}>
            <div className="form-group">
              <label htmlFor="repoName">Tên Repository</label>
              <input 
                type="text" 
                id="repoName" 
                name="repoName"
                value={formData.repoName}
                onChange={handleInputChange}
                placeholder="Nhập tên repo của bạn" 
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="realScript">Script Thật (Chỉ Executor thấy)</label>
              <textarea 
                id="realScript" 
                name="realScript"
                value={formData.realScript}
                onChange={handleInputChange}
                placeholder="Nhập mã nguồn thật của bạn..." 
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="fakeScript">Script Giả (Người dùng thường thấy)</label>
              <textarea 
                id="fakeScript" 
                name="fakeScript"
                value={formData.fakeScript}
                onChange={handleInputChange}
                placeholder="Nhập mã nguồn giả..." 
                required
              />
            </div>
            
            <button 
              type="submit" 
              className={`btn btn-primary ${loading ? 'loading' : ''}`} 
              disabled={loading}
            >
              {loading ? 'Đang tạo...' : 'Tạo Script URL'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setIsLoggedIn(false)}
            >
              Đăng Xuất
            </button>
            
            {result && (
              <div className="result show">
                <div style={{color:'#e6eef8',marginBottom:'8px',fontSize:'14px'}}>URL Script của bạn:</div>
                <div className="url-display">{result.url}</div>
                <button 
                  type="button" 
                  className="btn btn-success" 
                  onClick={() => copyToClipboard(result.url)}
                >
                  Copy URL
                </button>
                
                <div className="usage-example">
                  <strong>Cách sử dụng:</strong><br/>
                  - Trong Executor: <code>local data = game:HttpGet(&quot;{result.url}&quot;)</code><br/>
                  - Trong Browser/Termux: <code>curl &quot;{result.url}&quot;</code><br/>
                  <em>Executor sẽ thấy script thật, browser/curl sẽ thấy script giả</em>
                </div>
              </div>
            )}
          </form>
        )}
        
        {activeTab === 'manage' && (
          <div>
            <div id="scriptList">
              <p style={{textAlign: 'center', color: 'var(--text-secondary)', margin: '20px 0'}}>
                Chức năng quản lý script sẽ được phát triển trong phiên bản tiếp theo
              </p>
            </div>
            <button 
              className="btn btn-secondary" 
              onClick={() => setActiveTab('create')}
            >
              Quay lại tạo script
            </button>
          </div>
        )}
      </div>
    </>
  );
}
