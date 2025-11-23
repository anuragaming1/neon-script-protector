import { useState, useEffect } from 'react';
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
  const [scriptHistory, setScriptHistory] = useState([]);
  const [editingScript, setEditingScript] = useState(null);

  const VALID_USERNAME = "Anura123";
  const VALID_PASSWORD = "Anura123";

  // Load lịch sử khi đăng nhập
  useEffect(() => {
    if (isLoggedIn) {
      loadScriptHistory();
    }
  }, [isLoggedIn]);

  const loadScriptHistory = () => {
    const history = Array.from(global.scripts.values()).map(script => ({
      ...script,
      isDeleted: script.isDeleted || false
    }));
    setScriptHistory(history.reverse());
  };

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
  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          [field]: e.target.result
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
        setFormData({ repoName: '', realScript: '', fakeScript: '' });
        loadScriptHistory(); // Reload lịch sử
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

  // Xóa script
  const deleteScript = (id) => {
    if (confirm('Bạn có chắc muốn xóa script này?')) {
      const script = global.scripts.get(id);
      if (script) {
        script.isDeleted = true;
        script.deletedAt = new Date().toISOString();
        global.scripts.set(id, script);
        loadScriptHistory();
      }
    }
  };

  // Chỉnh sửa script
  const editScript = (script) => {
    setEditingScript(script);
    setFormData({
      repoName: script.repoName,
      realScript: script.realScript,
      fakeScript: script.fakeScript
    });
    setActiveTab('create');
  };

  // Cập nhật script
  const updateScript = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const script = global.scripts.get(editingScript.id);
      if (script) {
        script.repoName = formData.repoName;
        script.realScript = formData.realScript;
        script.fakeScript = formData.fakeScript;
        script.updatedAt = new Date().toISOString();
        
        global.scripts.set(editingScript.id, script);
        
        setEditingScript(null);
        setFormData({ repoName: '', realScript: '', fakeScript: '' });
        loadScriptHistory();
        alert('Cập nhật script thành công!');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Lỗi cập nhật script!');
    } finally {
      setLoading(false);
    }
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
      padding: '8px',
      background: 'rgba(10, 10, 22, 0.7)',
      border: '1px solid rgba(255, 7, 58, 0.3)',
      borderRadius: '8px',
      color: '#e6eef8',
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
    btnDanger: {
      background: 'linear-gradient(90deg, #dc2626, #b91c1c)',
      color: 'white'
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
    tabContainer: {
      display: 'flex',
      marginBottom: '20px',
      borderBottom: '1px solid rgba(255,255,255,0.1)'
    },
    tab: {
      padding: '10px 20px',
      cursor: 'pointer',
      fontWeight: '600',
      borderBottom: '2px solid transparent'
    },
    tabActive: {
      color: '#00f3ff',
      borderBottom: '2px solid #00f3ff'
    },
    scriptItem: {
      background: 'rgba(10, 10, 22, 0.7)',
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '10px',
      border: '1px solid rgba(255,255,255,0.1)'
    },
    scriptHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '10px'
    },
    scriptUrl: {
      color: '#00f3ff',
      fontFamily: 'monospace',
      fontSize: '12px',
      wordBreak: 'break-all'
    },
    scriptActions: {
      display: 'flex',
      gap: '10px'
    },
    smallBtn: {
      padding: '6px 12px',
      fontSize: '12px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer'
    },
    deletedBadge: {
      background: '#dc2626',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '600'
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
          <div style={styles.logo}>NEON SCRIPT PROTECTOR</div>
          <h1 style={styles.title}>
            {editingScript ? 'Chỉnh Sửa Script' : 'Tạo Script Bảo Mật'}
          </h1>
          
          <div style={styles.tabContainer}>
            <div 
              style={{...styles.tab, ...(activeTab === 'create' ? styles.tabActive : {})}}
              onClick={() => {
                setActiveTab('create');
                setEditingScript(null);
                setFormData({ repoName: '', realScript: '', fakeScript: '' });
              }}
            >
              {editingScript ? 'Chỉnh Sửa' : 'Tạo Script'}
            </div>
            <div 
              style={{...styles.tab, ...(activeTab === 'history' ? styles.tabActive : {})}}
              onClick={() => setActiveTab('history')}
            >
              Lịch Sử ({scriptHistory.length})
            </div>
          </div>
          
          {activeTab === 'create' && (
            <form onSubmit={editingScript ? updateScript : handleGenerate}>
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
                  Script Thật (Chỉ Executor thấy)
                </label>
                <input 
                  type="file" 
                  accept=".lua,.txt,.js"
                  onChange={(e) => handleFileUpload(e, 'realScript')}
                  style={styles.fileInput}
                />
                <textarea 
                  style={styles.textarea}
                  id="realScript" 
                  name="realScript"
                  value={formData.realScript}
                  onChange={handleInputChange}
                  placeholder="Hoặc paste mã nguồn thật của bạn..." 
                  required
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="fakeScript">
                  Script Giả (Người dùng thường thấy)
                </label>
                <input 
                  type="file" 
                  accept=".lua,.txt,.js"
                  onChange={(e) => handleFileUpload(e, 'fakeScript')}
                  style={styles.fileInput}
                />
                <textarea 
                  style={styles.textarea}
                  id="fakeScript" 
                  name="fakeScript"
                  value={formData.fakeScript}
                  onChange={handleInputChange}
                  placeholder="Hoặc paste mã nguồn giả..." 
                  required
                />
              </div>
              
              <button 
                type="submit" 
                style={{...styles.btn, ...styles.btnPrimary, opacity: loading ? 0.6 : 1}}
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : (editingScript ? 'Cập Nhật Script' : 'Tạo Script URL')}
              </button>
              
              {editingScript && (
                <button 
                  type="button" 
                  style={{...styles.btn, ...styles.btnSecondary}}
                  onClick={() => {
                    setEditingScript(null);
                    setFormData({ repoName: '', realScript: '', fakeScript: '' });
                  }}
                >
                  Hủy Chỉnh Sửa
                </button>
              )}
              
              <button 
                type="button" 
                style={{...styles.btn, ...styles.btnSecondary}}
                onClick={() => setIsLoggedIn(false)}
              >
                Đăng Xuất
              </button>
              
              {result && !editingScript && (
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
                  
                  <div style={{marginBottom: '12px', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px'}}>
                    <div style={{color: '#94a3b8', fontSize: '12px', marginBottom: '5px'}}>Code để copy:</div>
                    <code style={{color: '#00f3ff', fontFamily: 'monospace', fontSize: '12px'}}>
                      loadstring(game:HttpGet("{result.url}"))()
                    </code>
                  </div>
                  
                  <button 
                    type="button" 
                    style={{...styles.btn, ...styles.btnSuccess}}
                    onClick={() => copyToClipboard(`loadstring(game:HttpGet("${result.url}"))()`)}
                  >
                    Copy Code Executor
                  </button>
                </div>
              )}
            </form>
          )}
          
          {activeTab === 'history' && (
            <div>
              <h3 style={{color: '#e6eef8', marginBottom: '15px'}}>Lịch Sử Script</h3>
              
              {scriptHistory.length === 0 ? (
                <p style={{color: '#94a3b8', textAlign: 'center'}}>Chưa có script nào được tạo</p>
              ) : (
                scriptHistory.map(script => (
                  <div key={script.id} style={styles.scriptItem}>
                    <div style={styles.scriptHeader}>
                      <div>
                        <strong style={{color: '#e6eef8'}}>{script.repoName}</strong>
                        {script.isDeleted && (
                          <span style={{...styles.deletedBadge, marginLeft: '10px'}}>ĐÃ XÓA</span>
                        )}
                      </div>
                      <div style={styles.scriptActions}>
                        {!script.isDeleted && (
                          <>
                            <button 
                              style={{...styles.smallBtn, background: '#3b82f6', color: 'white'}}
                              onClick={() => editScript(script)}
                            >
                              Sửa
                            </button>
                            <button 
                              style={{...styles.smallBtn, background: '#dc2626', color: 'white'}}
                              onClick={() => deleteScript(script.id)}
                            >
                              Xóa
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div style={styles.scriptUrl}>
                      {typeof window !== 'undefined' && `${window.location.origin}/api/raw/${script.id}`}
                    </div>
                    
                    <div style={{marginTop: '8px', fontSize: '12px', color: '#94a3b8'}}>
                      Tạo: {new Date(script.createdAt).toLocaleString('vi-VN')}
                      {script.updatedAt && ` | Sửa: ${new Date(script.updatedAt).toLocaleString('vi-VN')}`}
                      {script.isDeleted && ` | Xóa: ${new Date(script.deletedAt).toLocaleString('vi-VN')}`}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
