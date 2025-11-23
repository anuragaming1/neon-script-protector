import { useState } from 'react';
import Head from 'next/head';

// Biến toàn cục để lưu scripts
if (typeof global.scripts === 'undefined') {
  global.scripts = new Map();
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState({
    repoName: '',
    realScript: '',
    fakeScript: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [realFile, setRealFile] = useState(null);
  const [fakeFile, setFakeFile] = useState(null);

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

  // Xử lý upload file thật
  const handleRealFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRealFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          realScript: e.target.result
        }));
      };
      reader.readAsText(file);
    }
  };

  // Xử lý upload file giả
  const handleFakeFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFakeFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          fakeScript: e.target.result
        }));
      };
      reader.readAsText(file);
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
      alert('Đã copy vào clipboard!');
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
      maxWidth: '600px',
      background: '#0d0d1a',
      borderRadius: '16px',
      padding: '30px',
      boxShadow: '0 0 20px rgba(255, 7, 58, 0.2)',
      border: '1px solid rgba(255, 7, 58, 0.3)',
      position: 'relative',
      overflow: 'hidden'
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
    fileInput: {
      width: '100%',
      padding: '12px 16px',
      background: 'rgba(10, 10, 22, 0.7)',
      border: '1px solid rgba(255, 7, 58, 0.3)',
      borderRadius: '8px',
      color: '#e6eef8',
      fontFamily: "'Poppins', sans-serif",
      fontSize: '14px'
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
    btnSecondary: {
      background: 'transparent',
      color: '#94a3b8',
      border: '1px solid rgba(255,255,255,0.2)'
    },
    btnSuccess: {
      background: 'linear-gradient(90deg, #10b981, #059669)',
      color: '#fff'
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
    },
    fileInfo: {
      fontSize: '12px',
      color: '#00f3ff',
      marginTop: '5px',
      fontStyle: 'italic'
    },
    codeBlock: {
      background: 'rgba(0, 0, 0, 0.3)',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid rgba(0, 243, 255, 0.3)',
      marginTop: '10px',
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#00f3ff',
      wordBreak: 'break-all'
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
            body::before {
              content: '';
              position: fixed;
              top: -2px;
              left: -2px;
              right: -2px;
              bottom: -2px;
              background: linear-gradient(45deg, #ff073a, #00f3ff, #ff073a);
              z-index: -1;
              animation: neon-border 3s linear infinite;
            }
          `}</style>
        </Head>
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.logo}>Anura Meow</div>
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
          body::before {
            content: '';
            position: fixed;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(45deg, #ff073a, #00f3ff, #ff073a);
            z-index: -1;
            animation: neon-border 3s linear infinite;
          }
        `}</style>
      </Head>
      
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.logo}>Anura Meow script </div>
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
              <label style={styles.label} htmlFor="realScript">
                Script Thật (Chỉ Executor thấy) - .lua, .luau, .txt
              </label>
              <input
                style={styles.fileInput}
                type="file"
                id="realFile"
                accept=".lua,.luau,.txt,.xml,.json,.py,.js,.css,.html"
                onChange={handleRealFileUpload}
              />
              {realFile && (
                <div style={styles.fileInfo}>
                  Đã chọn: {realFile.name} ({realFile.size} bytes)
                </div>
              )}
              <textarea 
                style={{...styles.textarea, marginTop: '10px'}}
                id="realScript" 
                name="realScript"
                value={formData.realScript}
                onChange={handleInputChange}
                placeholder="Hoặc paste mã nguồn thật của bạn tại đây..." 
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="fakeScript">
                Script Giả (Người dùng thường thấy) - .lua, .luau, .txt
              </label>
              <input
                style={styles.fileInput}
                type="file"
                id="fakeFile"
                accept=".lua,.luau,.txt,.xml,.json,.py,.js,.css,.html"
                onChange={handleFakeFileUpload}
              />
              {fakeFile && (
                <div style={styles.fileInfo}>
                  Đã chọn: {fakeFile.name} ({fakeFile.size} bytes)
                </div>
              )}
              <textarea 
                style={{...styles.textarea, marginTop: '10px'}}
                id="fakeScript" 
                name="fakeScript"
                value={formData.fakeScript}
                onChange={handleInputChange}
                placeholder="Hoặc paste mã nguồn giả tại đây..." 
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
              style={{...styles.btn, ...styles.btnSecondary}}
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
                <div style={{color:'#e6eef8',marginBottom:'8px',fontSize:'14px', fontWeight: '600'}}>
                  🎉 URL Script của bạn:
                </div>
                <div style={styles.codeBlock}>
                  {result.url}
                </div>
                
                <div style={{marginTop: '15px'}}>
  <div style={{color:'#e6eef8',marginBottom:'8px',fontSize:'14px', fontWeight: '600'}}>
    📋 Code để copy (Executor):
  </div>
  <div style={styles.codeBlock}>
    loadstring(game:HttpGet("{result.url}?executor=true"))()
  </div>
  <button 
    type="button" 
    style={{...styles.btn, ...styles.btnSuccess, marginTop: '10px'}}
    onClick={() => copyToClipboard(`loadstring(game:HttpGet("${result.url}?executor=true"))()`)}
  >
    Copy Executor Code
  </button>
</div>
                
                <div style={{marginTop: '15px'}}>
                  <div style={{color:'#e6eef8',marginBottom:'8px',fontSize:'14px', fontWeight: '600'}}>
                    🌐 Test với curl:
                  </div>
                  <div style={styles.codeBlock}>
                    curl "{result.url}"
                  </div>
                  <button 
                    type="button" 
                    style={{...styles.btn, ...styles.btnSecondary, marginTop: '10px'}}
                    onClick={() => copyToClipboard(result.url)}
                  >
                    Copy Raw URL
                  </button>
                </div>
                
                <div style={{
                  marginTop: '15px',
                  padding: '12px',
                  background: 'rgba(255, 7, 58, 0.1)',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 7, 58, 0.3)',
                  fontSize: '12px',
                  color: '#94a3b8'
                }}>
                  <strong>💡 Lưu ý:</strong><br/>
                  - Executor sẽ thấy script thật<br/>
                  - Browser/Termux sẽ thấy script giả<br/>
                  - Hỗ trợ file: .lua, .luau, .txt, .xml, .json, .py, .js, .css, .html
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
