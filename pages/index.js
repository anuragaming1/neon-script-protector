import { useState, useRef } from 'react';
import Head from 'next/head';

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
  const realFileInputRef = useRef(null);
  const fakeFileInputRef = useRef(null);

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

  // Xử lý upload file
  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData(prev => ({
        ...prev,
        [type === 'real' ? 'realScript' : 'fakeScript']: e.target.result
      }));
    };
    reader.readAsText(file);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    if (!formData.realScript || !formData.fakeScript) {
      alert('Vui lòng nhập cả script thật và script giả!');
      return;
    }

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
        alert('Lỗi: ' + (data.error || 'Không thể tạo script'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Lỗi kết nối đến server!');
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
      alert('✅ Đã copy!');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const clearForm = () => {
    setFormData({ repoName: '', realScript: '', fakeScript: '' });
    if (realFileInputRef.current) realFileInputRef.current.value = '';
    if (fakeFileInputRef.current) fakeFileInputRef.current.value = '';
    setResult(null);
  };

  // CSS Styles
  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0a16 0%, #050510 100%)',
      fontFamily: "'Poppins', sans-serif",
      padding: '20px',
      margin: 0,
      position: 'relative',
      overflow: 'hidden'
    },
    neonGlow: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(45deg, #ff073a, #00f3ff, #ff073a)',
      backgroundSize: '400% 400%',
      animation: 'gradient 15s ease infinite',
      opacity: 0.1,
      zIndex: -1
    },
    card: {
      width: '100%',
      maxWidth: '700px',
      background: 'rgba(13, 13, 26, 0.95)',
      borderRadius: '20px',
      padding: '40px',
      boxShadow: '0 0 50px rgba(255, 7, 58, 0.3), 0 0 100px rgba(0, 243, 255, 0.2)',
      border: '2px solid rgba(255, 7, 58, 0.4)',
      position: 'relative',
      backdropFilter: 'blur(10px)',
      zIndex: 1
    },
    title: {
      textAlign: 'center',
      marginBottom: '30px',
      fontWeight: '700',
      fontSize: '32px',
      background: 'linear-gradient(90deg, #ff073a 0%, #00f3ff 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '0 0 20px rgba(255, 7, 58, 0.5)'
    },
    formGroup: {
      marginBottom: '25px'
    },
    label: {
      display: 'block',
      marginBottom: '10px',
      fontWeight: '600',
      color: '#e6eef8',
      fontSize: '14px'
    },
    input: {
      width: '100%',
      padding: '14px 18px',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '2px solid rgba(255, 7, 58, 0.3)',
      borderRadius: '10px',
      color: '#fff',
      fontFamily: "'Poppins', sans-serif",
      fontSize: '15px',
      transition: 'all 0.3s'
    },
    textarea: {
      width: '100%',
      padding: '14px 18px',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '2px solid rgba(255, 7, 58, 0.3)',
      borderRadius: '10px',
      color: '#fff',
      fontFamily: 'monospace',
      fontSize: '14px',
      minHeight: '150px',
      resize: 'vertical',
      lineHeight: '1.5'
    },
    fileInput: {
      width: '100%',
      padding: '12px',
      background: 'rgba(255, 7, 58, 0.1)',
      border: '2px dashed rgba(255, 7, 58, 0.4)',
      borderRadius: '10px',
      color: '#fff',
      cursor: 'pointer'
    },
    btn: {
      display: 'block',
      width: '100%',
      padding: '16px',
      border: 'none',
      borderRadius: '12px',
      fontFamily: "'Poppins', sans-serif",
      fontSize: '16px',
      fontWeight: '700',
      cursor: 'pointer',
      textAlign: 'center',
      marginTop: '15px',
      transition: 'all 0.3s',
      letterSpacing: '0.5px'
    },
    btnPrimary: {
      background: 'linear-gradient(90deg, #ff073a 0%, #00f3ff 100%)',
      color: 'white',
      boxShadow: '0 0 20px rgba(255, 7, 58, 0.4)'
    },
    btnSecondary: {
      background: 'rgba(255, 255, 255, 0.05)',
      color: '#94a3b8',
      border: '2px solid rgba(255, 255, 255, 0.1)'
    },
    btnSuccess: {
      background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
      color: '#fff',
      boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
    },
    error: {
      color: '#ff073a',
      fontSize: '14px',
      marginTop: '10px',
      textAlign: 'center',
      fontWeight: '600'
    },
    logo: {
      textAlign: 'center',
      marginBottom: '20px',
      fontSize: '28px',
      fontWeight: '800',
      background: 'linear-gradient(90deg, #ff073a, #00f3ff)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '0 0 30px rgba(255, 7, 58, 0.7)'
    },
    resultBox: {
      marginTop: '30px',
      padding: '25px',
      background: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '15px',
      border: '2px solid rgba(0, 243, 255, 0.3)',
      animation: 'fadeIn 0.5s ease'
    },
    codeBlock: {
      background: 'rgba(0, 0, 0, 0.5)',
      padding: '15px',
      borderRadius: '10px',
      border: '1px solid rgba(0, 243, 255, 0.2)',
      marginTop: '10px',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '13px',
      color: '#00f3ff',
      wordBreak: 'break-all',
      overflowX: 'auto',
      lineHeight: '1.4'
    },
    infoBox: {
      marginTop: '20px',
      padding: '20px',
      background: 'rgba(255, 7, 58, 0.1)',
      borderRadius: '10px',
      border: '1px solid rgba(255, 7, 58, 0.3)',
      fontSize: '13px',
      color: '#94a3b8',
      lineHeight: '1.6'
    }
  };

  if (!isLoggedIn) {
    return (
      <>
        <Head>
          <title>🔒 Neon Script Protector - Đăng Nhập</title>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&display=swap" rel="stylesheet" />
          <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
          <style jsx global>{`
            @keyframes gradient {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            body {
              margin: 0;
              padding: 0;
              overflow-x: hidden;
            }
            input:focus, textarea:focus {
              outline: none;
              border-color: #00f3ff !important;
              box-shadow: 0 0 15px rgba(0, 243, 255, 0.3) !important;
            }
            button:hover {
              transform: translateY(-2px) !important;
              box-shadow: 0 5px 20px rgba(255, 7, 58, 0.6) !important;
            }
          `}</style>
        </Head>
        <div style={styles.container}>
          <div style={styles.neonGlow} />
          <div style={styles.card}>
            <div style={styles.logo}>NEON SCRIPT PROTECTOR 🔥</div>
            <h1 style={styles.title}>ĐĂNG NHẬP HỆ THỐNG</h1>
            <form onSubmit={handleLogin}>
              <div style={styles.formGroup}>
                <label style={styles.label}>👤 TÊN ĐĂNG NHẬP</label>
                <input 
                  style={styles.input}
                  type="text" 
                  name="username" 
                  placeholder="Nhập username của bạn"
                  required 
                  autoComplete="username"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>🔐 MẬT KHẨU</label>
                <input 
                  style={styles.input}
                  type="password" 
                  name="password" 
                  placeholder="Nhập mật khẩu"
                  required 
                  autoComplete="current-password"
                />
              </div>
              <button type="submit" style={{...styles.btn, ...styles.btnPrimary}}>
                🚀 ĐĂNG NHẬP
              </button>
              {loginError && (
                <div style={styles.error}>
                  ⚠️ Sai tên đăng nhập hoặc mật khẩu!
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
        <title>🚀 Neon Script Protector - Tạo Script</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style jsx global>{`
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          body {
            margin: 0;
            padding: 0;
            overflow-x: hidden;
          }
        `}</style>
      </Head>
      
      <div style={styles.container}>
        <div style={styles.neonGlow} />
        <div style={styles.card}>
          <div style={styles.logo}>NEON SCRIPT PROTECTOR 🛡️</div>
          <h1 style={styles.title}>TẠO SCRIPT BẢO MẬT</h1>
          
          <form onSubmit={handleGenerate}>
            {/* Repository Name */}
            <div style={styles.formGroup}>
              <label style={styles.label}>📁 TÊN REPOSITORY</label>
              <input 
                style={styles.input}
                type="text" 
                name="repoName"
                value={formData.repoName}
                onChange={handleInputChange}
                placeholder="Nhập tên repo của bạn..." 
                required
              />
            </div>
            
            {/* Real Script */}
            <div style={styles.formGroup}>
              <label style={styles.label}>✅ SCRIPT THẬT (Chỉ Executor thấy)</label>
              <input
                style={styles.fileInput}
                type="file"
                ref={realFileInputRef}
                accept=".lua,.luau,.txt"
                onChange={(e) => handleFileUpload(e, 'real')}
              />
              <textarea 
                style={{...styles.textarea, marginTop: '15px'}}
                name="realScript"
                value={formData.realScript}
                onChange={handleInputChange}
                placeholder="Paste mã nguồn thật của bạn tại đây (Lua/Luau)..."
                required
              />
            </div>
            
            {/* Fake Script */}
            <div style={styles.formGroup}>
              <label style={styles.label}>❌ SCRIPT GIẢ (Browser/Termux thấy)</label>
              <input
                style={styles.fileInput}
                type="file"
                ref={fakeFileInputRef}
                accept=".lua,.luau,.txt"
                onChange={(e) => handleFileUpload(e, 'fake')}
              />
              <textarea 
                style={{...styles.textarea, marginTop: '15px'}}
                name="fakeScript"
                value={formData.fakeScript}
                onChange={handleInputChange}
                placeholder="Paste mã nguồn giả tại đây..."
                required
              />
            </div>
            
            {/* Buttons */}
            <button 
              type="submit" 
              style={{...styles.btn, ...styles.btnPrimary, opacity: loading ? 0.7 : 1}}
              disabled={loading}
            >
              {loading ? '⏳ ĐANG XỬ LÝ...' : '⚡ TẠO SCRIPT URL'}
            </button>
            
            <button 
              type="button" 
              style={{...styles.btn, ...styles.btnSecondary}}
              onClick={clearForm}
            >
              🗑️ XÓA TẤT CẢ
            </button>
            
            <button 
              type="button" 
              style={{...styles.btn, ...styles.btnSecondary}}
              onClick={() => setIsLoggedIn(false)}
            >
              🔒 ĐĂNG XUẤT
            </button>
          </form>
          
          {/* Results */}
          {result && (
            <div style={styles.resultBox}>
              <div style={{color:'#fff',marginBottom:'20px',fontSize:'18px', fontWeight: '700'}}>
                🎉 TẠO THÀNH CÔNG!
              </div>
              
              {/* Raw URL */}
              <div style={{marginBottom: '20px'}}>
                <div style={{color:'#94a3b8',marginBottom:'8px',fontSize:'14px'}}>🔗 RAW URL:</div>
                <div style={styles.codeBlock}>{result.url}</div>
                <button 
                  style={{...styles.btn, ...styles.btnSecondary, marginTop: '10px', padding: '12px'}}
                  onClick={() => copyToClipboard(result.url)}
                >
                  📋 Copy Raw URL
                </button>
              </div>
              
              {/* Executor Code */}
              <div style={{marginBottom: '20px'}}>
                <div style={{color:'#94a3b8',marginBottom:'8px',fontSize:'14px'}}>🎮 EXECUTOR CODE:</div>
                <div style={styles.codeBlock}>
                  loadstring(game:HttpGet("{result.url}?source=roblox"))()
                </div>
                <button 
                  style={{...styles.btn, ...styles.btnSuccess, marginTop: '10px', padding: '12px'}}
                  onClick={() => copyToClipboard(`loadstring(game:HttpGet("${result.url}?source=roblox"))()`)}
                >
                  🎯 Copy Executor Code
                </button>
              </div>
              
              {/* Info Box */}
              <div style={styles.infoBox}>
                <strong>📋 HƯỚNG DẪN SỬ DỤNG:</strong><br/><br/>
                
                <strong>🎮 CHO EXECUTOR (Roblox):</strong><br/>
                • Dùng code trên với parameter <code>?source=roblox</code><br/>
                • Executor sẽ nhận được script THẬT<br/>
                • Hỗ trợ: Synapse, Krnl, Fluxus, Delta, Script-Ware<br/><br/>
                
                <strong>🌐 CHO BROWSER/TERMUX:</strong><br/>
                • Dùng URL không có parameter<br/>
                • Sẽ thấy script GIẢ<br/>
                • Test: <code>curl "{result.url}"</code><br/><br/>
                
                <strong>💾 LƯU TRỮ:</strong><br/>
                • Script được lưu VĨNH VIỄN trong database<br/>
                • Tự động cleanup sau 30 ngày không dùng<br/>
                • Hỗ trợ file: .lua, .luau, .txt
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
