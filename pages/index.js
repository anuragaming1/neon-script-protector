import { useState } from 'react';
import Head from 'next/head';

// Biến toàn cục để lưu scripts
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

  // CSS variables
  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #050510, #0b1020)',
      fontFamily: "'Poppins', sans-serif",
      padding: '20px',
      margin: 0
    },
    card: {
      width: '100%',
      maxWidth: '500px',
      background: '#0d0d1a',
      borderRadius: '16px',
      padding: '30px',
      boxShadow: '0 0 20px rgba(255, 7, 58, 0.2)',
      border: '1px solid rgba(255, 7, 58, 0.3)',
      position: 'relative',
      overflow: 'hidden'
    },
    cardBefore: {
      content: '""',
      position: 'absolute',
      top: '-2px',
      left: '-2px',
      right: '-2px',
      bottom: '-2px',
      background: 'linear-gradient(45deg, #ff073a, #00f3ff, #ff073a)',
      borderRadius: '18px',
      zIndex: -1,
      animation: 'neon-border 3s linear infinite'
    },
    title: {
      textAlign: 'center',
      marginBottom: '24px',
      fontWeight: '700',
      fontSize: '28px',
      background: 'linear-gradient(90deg, #ff073a, #00f3ff)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '0 0 10px rgba(255, 7, 58, 0.5)'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '600',
      color: '#94a3b8'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      background: 'rgba(10, 10, 22, 0.7)',
      border: '1px solid rgba(255, 7, 58, 0.3)',
      borderRadius: '8px',
      color: '#e6eef8',
      fontFamily: "'Poppins', sans-serif",
      fontSize: '14px'
    },
    textarea: {
      width: '100%',
      padding: '12px 16px',
      background: 'rgba(10, 10, 22, 0.7)',
      border: '1px solid rgba(255, 7, 58, 0.3)',
      borderRadius: '8px',
      color: '#e6eef8',
      fontFamily: 'monospace',
      fontSize: '14px',
      minHeight: '120px',
      resize: 'vertical'
    },
    btn: {
      display: 'block',
      width: '100%',
      padding: '14px',
      border: 'none',
      borderRadius: '8px',
      fontFamily: "'Poppins', sans-serif",
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      textAlign: 'center',
      marginTop: '10px'
    },
    btnPrimary: {
      background: 'linear-gradient(90deg, #ff073a, #00f3ff)',
      color: 'white',
      boxShadow: '0 0 15px rgba(255, 7, 58, 0.4)'
    },
    error: {
      color: '#ff073a',
      fontSize: '14px',
      marginTop: '8px',
      textAlign: 'center'
    },
    logo: {
      textAlign: 'center',
      marginBottom: '20px',
      fontSize: '24px',
      fontWeight: '700',
      textShadow: '0 0 10px rgba(255, 7, 58, 0.7)'
    }
  };

  if (!isLoggedIn) {
    return (
      <>
        <Head>
          <title>Neon Script Protector - Đăng Nhập</title>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet" />
          <style jsx global>{`
            @keyframes neon-border {
              0% { filter: hue-rotate(0deg); }
              100% { filter: hue-rotate(360deg); }
            }
          `}</style>
        </Head>
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.logo}>NEON SCRIPT PROTECTOR</div>
            <h1 style={styles.title}>Đăng Nhập</h1>
            <form onSubmit={handleLogin}>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="username">Tên đăng nhập</label>
                <input 
                  style={styles.input}
                  type="text" 
                  id="username" 
                  name="username" 
                  placeholder="Nhập tên đăng nhập"
                  required 
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="password">Mật khẩu</label>
                <input 
                  style={styles.input}
                  type="password" 
                  id="password" 
                  name="password" 
                  placeholder="Nhập mật khẩu"
                  required 
                />
              </div>
              <button type="submit" style={{...styles.btn, ...styles.btnPrimary}}>Đăng Nhập</button>
              {loginError && (
                <div style={styles.error}>
                  Tên đăng nhập hoặc mật khẩu không đúng!
                </div>
              )}
            </form>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Neon Script Protector</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet" />
        <style jsx global>{`
          @keyframes neon-border {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
          }
        `}</style>
      </Head>
      
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.logo}>NEON SCRIPT PROTECTOR</div>
          <h1 style={styles.title}>Tạo Script Bảo Mật</h1>
          
          <form onSubmit={handleGenerate}>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="repoName">Tên Repository</label>
              <input 
                style={styles.input}
                type="text" 
                id="repoName" 
                name="repoName"
                value={formData.repoName}
                onChange={handleInputChange}
                placeholder="Nhập tên repo của bạn" 
                required
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="realScript">Script Thật (Chỉ Executor thấy)</label>
              <textarea 
                style={styles.textarea}
                id="realScript" 
                name="realScript"
                value={formData.realScript}
                onChange={handleInputChange}
                placeholder="Nhập mã nguồn thật của bạn..." 
                required
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="fakeScript">Script Giả (Người dùng thường thấy)</label>
              <textarea 
                style={styles.textarea}
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
              style={{...styles.btn, ...styles.btnPrimary, opacity: loading ? 0.6 : 1}}
              disabled={loading}
            >
              {loading ? 'Đang tạo...' : 'Tạo Script URL'}
            </button>
            <button 
              type="button" 
              style={{...styles.btn, background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.2)'}}
              onClick={() => setIsLoggedIn(false)}
            >
              Đăng Xuất
            </button>
            
            {result && (
              <div style={{
                marginTop: '20px',
                padding: '16px',
                background: 'rgba(10, 10, 22, 0.7)',
                borderRadius: '8px',
                border: '1px solid rgba(0, 243, 255, 0.3)'
              }}>
                <div style={{color:'#e6eef8',marginBottom:'8px',fontSize:'14px'}}>URL Script của bạn:</div>
                <div style={{
                  wordBreak: 'break-all',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  color: '#00f3ff',
                  marginBottom: '12px',
                  padding: '8px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '4px'
                }}>{result.url}</div>
                <button 
                  type="button" 
                  style={{...styles.btn, background: 'linear-gradient(90deg, #10b981, #059669)', color: '#fff'}}
                  onClick={() => copyToClipboard(result.url)}
                >
                  Copy URL
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
