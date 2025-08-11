import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import { useCamera } from '../hooks/useCamera.jsx';
import { useStreamManager } from '../hooks/useStreamManager.jsx';
import AdminLiveModal from '../components/AdminLiveModal.jsx';
import './Admin.css';

const Admin = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { connected, streamStatus: wsStreamStatus, viewerCount: wsViewerCount } = useWebSocket();
  
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [streamForm, setStreamForm] = useState({
    title: 'CLB Gà Chọi Anh Cương - Live Stream',
    description: 'Xổ gà trực tiếp 18h hàng ngày',
  });

  // Use optimized hooks
  const { isStreaming, error: cameraError, videoRef, startCamera, stopCamera } = useCamera();
  const { 
    streamStatus, 
    loading, 
    error: streamError, 
    message, 
    controlStream, 
    updateFromWebSocket 
  } = useStreamManager();

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    fetchStreamStatus();
    // Increase polling frequency since WebSocket is disabled
    const interval = setInterval(fetchStreamStatus, 3000); // 3 seconds
    return () => clearInterval(interval);
  }, []);

  // Real-time updates from WebSocket if available
  useEffect(() => {
    if (connected && wsStreamStatus) {
      setStreamStatus(prevStatus => ({
        ...prevStatus,
        ...wsStreamStatus,
        viewerCount: wsViewerCount || prevStatus?.viewerCount || 0
      }));
    }
  }, [wsStreamStatus, wsViewerCount, connected]);

  // Debug logging
  useEffect(() => {
    console.log('🎬 Admin component state:', {
      streamStatus,
      streamIsLive: streamStatus?.isLive,
      loading,
      connected,
      isStreaming,
      streamForm
    });
  }, [streamStatus, loading, connected, isStreaming, streamForm]);

  // Auto camera management - Cải thiện logic
  useEffect(() => {
    const isLiveStatus = streamStatus?.isLive || streamStatus?.live;
    console.log('🎬 Camera management effect triggered:', { 
      streamIsLive: isLiveStatus, 
      isStreaming, 
      streamRef: !!streamRef.current 
    });
    
    if (isLiveStatus && !isStreaming && !streamRef.current) {
      console.log('📹 Stream is live but camera not started, starting camera...');
      startCamera();
    } else if (!isLiveStatus && isStreaming) {
      console.log('⏹️ Stream stopped, stopping camera...');
      stopCamera();
    }
  }, [streamStatus?.isLive, streamStatus?.live]);

  // Cleanup camera khi component unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const fetchStreamStatus = useCallback(async () => {
    // Always fetch since WebSocket is disabled temporarily
    try {
      const response = await liveStreamAPI.getStatus();
      setStreamStatus(response.data);
    } catch (error) {
      console.error('Error fetching stream status:', error);
    }
  }, []);

  const handleStreamControl = async (action) => {
    console.log('🎯 handleStreamControl called with action:', action);
    setLoading(true);
    setError('');
    setMessage('');

    try {
      let title = streamForm.title;
      let description = streamForm.description;
      
      console.log('📝 Stream form data:', { title, description });
      
      if (action === 'STOP') {
        title = '';
        description = '';
      }

      console.log('🚀 Calling API with:', { action, title, description });
      const response = await liveStreamAPI.controlStream(action, title, description);
      console.log('✅ API response:', response);
      console.log('📊 Response data details:', response.data);
      console.log('🔍 Is Live status:', response.data?.isLive);
      
      setStreamStatus(response.data);
      setMessage(`Stream ${action.toLowerCase()} thành công!`);
      
      // Mở modal và tự động bật camera khi stream bắt đầu
      if (action === 'START' && (response.data?.isLive || response.data?.live)) {
        console.log('🎥 Opening live modal and starting camera... (isLive:', response.data?.isLive, 'live:', response.data?.live, ')');
        setIsLiveModalOpen(true);
      }
      
      // Đóng modal và tự động tắt camera khi stream dừng
      if (action === 'STOP') {
        console.log('🛑 Closing live modal and stopping camera...');
        setIsLiveModalOpen(false);
        stopCamera();
      }
    } catch (error) {
      console.error('❌ Error controlling stream:', error);
      setError('Có lỗi xảy ra khi điều khiển stream: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setStreamForm({
      ...streamForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      logout();
      navigate('/');
    }
  };

  const startCamera = useCallback(async () => {
    // Prevent multiple camera access attempts
    if (isStreaming || streamRef.current) {
      console.log('📹 Camera already active or starting...');
      setMessage('Camera đã được bật rồi!');
      return;
    }

    console.log('🎥 Starting camera...');
    setError(''); // Clear any previous errors

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: 'user',
          frameRate: { ideal: 30, min: 15 }
        }, 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      console.log('✅ Camera access granted');
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
        setRetryCount(0);
        setMessage('Camera đã được bật thành công! Đang phát trực tiếp.');
        setError('');
        
        // Monitor stream health
        stream.getTracks().forEach(track => {
          track.addEventListener('ended', () => {
            console.log(`${track.kind} track ended`);
            handleStreamEnd();
          });
        });
        
        console.log('🔴 Camera is now LIVE!');
      }
    } catch (error) {
      console.error('❌ Error accessing camera:', error);
      handleCameraError(error);
    }
  }, [isStreaming]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.kind);
      });
      streamRef.current = null;
      setIsStreaming(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setMessage('Camera đã được tắt.');
    }
  }, []);

  const handleStreamEnd = useCallback(() => {
    setIsStreaming(false);
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    // Auto-retry camera if stream is still live
    if (streamStatus?.isLive && retryCount < 3) {
      setRetryCount(prev => prev + 1);
      setMessage(`Camera bị ngắt, đang thử kết nối lại... (${retryCount + 1}/3)`);
      setTimeout(() => {
        startCamera();
      }, 2000);
    } else {
      setError('Camera đã bị ngắt kết nối. Vui lòng bật lại.');
    }
  }, [streamStatus?.isLive, retryCount, startCamera]);

  const handleCameraError = useCallback((error) => {
    setIsStreaming(false);
    let errorMessage = 'Không thể truy cập camera.';
    
    if (error.name === 'NotAllowedError') {
      errorMessage = '🚫 Trình duyệt đã chặn quyền truy cập camera! Vui lòng:\n1. Nhấn vào biểu tượng 🔒 hoặc 🛡️ bên trái thanh địa chỉ\n2. Cho phép Camera và Microphone\n3. Tải lại trang và thử lại';
    } else if (error.name === 'NotFoundError') {
      errorMessage = '📷 Không tìm thấy camera hoặc microphone trên thiết bị này.';
    } else if (error.name === 'NotReadableError') {
      errorMessage = '⚠️ Camera đang được sử dụng bởi ứng dụng khác. Vui lòng đóng các ứng dụng khác và thử lại.';
    } else if (error.name === 'OverconstrainedError') {
      errorMessage = '⚙️ Thiết bị không hỗ trợ độ phân giải yêu cầu.';
    } else if (error.name === 'SecurityError') {
      errorMessage = '🔒 Lỗi bảo mật: Vui lòng đảm bảo bạn đang truy cập qua HTTPS hoặc localhost.';
    }
    
    setError(`${errorMessage}\n\nChi tiết kỹ thuật: ${error.message}`);
    console.error('Camera Error Details:', {
      name: error.name,
      message: error.message,
      constraint: error.constraint
    });
  }, []);

  if (!isAdmin()) {
    return <div>Loading...</div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <div className="admin-title">
            <h1>🎛️ Trang Quản Trị Live Stream</h1>
            <p>CLB Gà Chọi Anh Cương</p>
          </div>
          <div className="admin-user">
            <span>Xin chào, <strong>{user?.username}</strong></span>
            <button onClick={handleLogout} className="logout-btn">
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="admin-nav">
          <a href="/" className="nav-link" target="_blank" rel="noopener noreferrer">
            🏠 Xem trang khách hàng
          </a>
          <button onClick={fetchStreamStatus} className="refresh-btn">
            🔄 Làm mới
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="alert alert-error" style={{ whiteSpace: 'pre-line', fontSize: '14px', lineHeight: '1.5' }}>
            <strong>❌ Lỗi:</strong><br/>
            {error}
          </div>
        )}

        {message && (
          <div className="alert alert-success" style={{ fontSize: '14px' }}>
            <strong>ℹ️ Thông báo:</strong> {message}
          </div>
        )}

        {/* Stream Status */}
        <div className="status-section">
          <h2>📺 Trạng Thái Live Stream</h2>
          <div className="status-card">
            <div className="status-info">
              <div className="status-item">
                <span className="label">Trạng thái:</span>
                <span className={`status ${(streamStatus?.isLive || streamStatus?.live) ? 'live' : 'offline'}`}>
                  {(streamStatus?.isLive || streamStatus?.live) ? '🔴 ĐANG PHÁT' : '⚫ OFFLINE'}
                </span>
              </div>
              
              {(streamStatus?.isLive || streamStatus?.live) && (
                <>
                  <div className="status-item">
                    <span className="label">Tiêu đề:</span>
                    <span>{streamStatus.streamTitle}</span>
                  </div>
                  
                  <div className="status-item">
                    <span className="label">Mô tả:</span>
                    <span>{streamStatus.streamDescription}</span>
                  </div>
                  
                  <div className="status-item">
                    <span className="label">Bắt đầu:</span>
                    <span>{new Date(streamStatus.startTime).toLocaleString('vi-VN')}</span>
                  </div>
                  
                  <div className="status-item">
                    <span className="label">Người xem:</span>
                    <span className="viewer-count">👥 {streamStatus.viewerCount}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stream Controls */}
        <div className="control-section">
          <h2>🎮 Điều Khiển Live Stream</h2>
          
          {/* Test Camera Button - Luôn hiển thị để debug */}
          <div className="control-card" style={{ marginBottom: '20px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6' }}>
            <h3>🧪 Test Camera (Debug)</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={startCamera}
                disabled={loading || isStreaming}
                className="control-btn"
                style={{ background: '#16a34a' }}
              >
                {isStreaming ? '✅ Camera Đang Hoạt Động' : '📹 Test Camera'}
              </button>
              
              {isStreaming && (
                <button
                  onClick={stopCamera}
                  className="control-btn"
                  style={{ background: '#dc2626' }}
                >
                  ⏹️ Tắt Camera
                </button>
              )}
              
              <span style={{ color: '#6b7280', fontSize: '14px' }}>
                {isStreaming ? '🟢 Camera đang chạy' : '🔴 Camera chưa bật'}
              </span>
              
              <button
                onClick={() => {
                  console.log('🐛 DEBUG - Current State:', {
                    streamStatus,
                    isLive: streamStatus?.isLive,
                    live: streamStatus?.live,
                    finalIsLive: streamStatus?.isLive || streamStatus?.live,
                    isStreaming,
                    hasVideoStream: !!streamRef.current
                  });
                  alert(`DEBUG INFO:\nStream Status: ${JSON.stringify(streamStatus, null, 2)}\nIs Live (isLive): ${streamStatus?.isLive}\nIs Live (live): ${streamStatus?.live}\nFinal Is Live: ${streamStatus?.isLive || streamStatus?.live}\nCamera Streaming: ${isStreaming}`);
                }}
                style={{ 
                  background: '#8b5cf6', 
                  color: 'white', 
                  border: 'none', 
                  padding: '5px 10px', 
                  borderRadius: '5px',
                  fontSize: '12px'
                }}
              >
                🐛 Debug Info
              </button>
            </div>
            
            {/* Camera Preview luôn hiển thị khi có stream */}
            {isStreaming && (
              <div className="camera-preview" style={{ marginTop: '15px' }}>
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline 
                  muted={false}
                  controls={false}
                  className="admin-preview-video"
                  style={{ maxWidth: '400px', border: '2px solid #16a34a' }}
                />
                <p style={{ color: '#16a34a', marginTop: '10px' }}>✅ Camera đang hoạt động!</p>
              </div>
            )}
          </div>
          
          {!(streamStatus?.isLive || streamStatus?.live) ? (
            <div className="control-card">
              <h3>Bắt đầu Live Stream</h3>
              <form className="stream-form" onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                  <label htmlFor="title">Tiêu đề stream:</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={streamForm.title}
                    onChange={handleFormChange}
                    disabled={loading}
                    placeholder="Nhập tiêu đề stream"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Mô tả stream:</label>
                  <textarea
                    id="description"
                    name="description"
                    value={streamForm.description}
                    onChange={handleFormChange}
                    disabled={loading}
                    placeholder="Nhập mô tả stream"
                    rows={3}
                  />
                </div>

                <button
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔥 Button clicked!');
                    
                    // Hiển thị loading state ngay lập tức
                    setLoading(true);
                    setError('');
                    setMessage('Đang bắt đầu live stream...');
                    
                    try {
                      await handleStreamControl('START');
                    } catch (err) {
                      console.error('❌ Error in button click:', err);
                      setError(`Lỗi khi bắt đầu stream: ${err.message}`);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="control-btn start-btn"
                >
                  {loading ? '⏳ Đang bắt đầu...' : '▶️ Bắt đầu Live Stream'}
                </button>
              </form>
            </div>
          ) : (
            <div className="control-card">
              <h3>Stream đang hoạt động</h3>
              
              {/* Camera Preview */}
              <div className="admin-camera-section">
                <div className="camera-status">
                  <span className={`status-indicator ${isStreaming ? 'live' : 'offline'}`}>
                    {isStreaming ? '🔴 Camera LIVE' : '⚫ Camera OFF'}
                  </span>
                  <span className="connection-status live">
                    WebSocket: {connected ? '✅ Kết nối' : '❌ Mất kết nối'}
                  </span>
                </div>
                
                {isStreaming && (
                  <div className="camera-preview">
                    <video 
                      ref={videoRef}
                      autoPlay 
                      playsInline 
                      muted={false}
                      controls={false}
                      className="admin-preview-video"
                    />
                    <div className="camera-info">
                      <p>✅ Camera đang phát trực tiếp</p>
                      <p>👥 Viewers: {streamStatus?.viewerCount || wsViewerCount || 0}</p>
                    </div>
                  </div>
                )}
                
                <div className="camera-controls">
                  {!isStreaming ? (
                    <button onClick={startCamera} className="camera-btn start">
                      📹 Bật Camera
                    </button>
                  ) : (
                    <button onClick={stopCamera} className="camera-btn stop">
                      ⏹️ Tắt Camera
                    </button>
                  )}
                </div>
              </div>
              
              <div className="active-controls">
                <button
                  onClick={() => setIsLiveModalOpen(true)}
                  className="control-btn modal-btn"
                  style={{ background: '#3b82f6', marginRight: '10px' }}
                >
                  📺 Mở Cửa Sổ Live Stream
                </button>

                <button
                  onClick={() => handleStreamControl('STOP')}
                  disabled={loading}
                  className="control-btn stop-btn"
                >
                  {loading ? '⏳ Đang dừng...' : '⏹️ Dừng Live Stream'}
                </button>

                <button
                  onClick={() => handleStreamControl('PAUSE')}
                  disabled={loading}
                  className="control-btn pause-btn"
                >
                  {loading ? '⏳ Đang tạm dừng...' : '⏸️ Tạm dừng'}
                </button>
                
                {/* Nút bật camera thủ công nếu cần */}
                {!isStreaming && (
                  <button
                    onClick={startCamera}
                    disabled={loading}
                    className="control-btn camera-btn"
                    style={{ background: '#16a34a', marginLeft: '10px' }}
                  >
                    📹 Bật Camera Thủ Công
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Stream Instructions */}
        <div className="instructions-section">
          <h2>📋 Hướng Dẫn Sử Dụng</h2>
          <div className="instructions-card">
            <div className="instruction-item">
              <h4>🎯 Bắt đầu Live Stream:</h4>
              <p>1. Nhập tiêu đề và mô tả cho stream</p>
              <p>2. Nhấn nút "Bắt đầu Live Stream"</p>
              <p>3. Stream sẽ hiển thị trên trang chủ cho khách hàng</p>
            </div>

            <div className="instruction-item">
              <h4>⏹️ Dừng Live Stream:</h4>
              <p>1. Nhấn nút "Dừng Live Stream"</p>
              <p>2. Stream sẽ kết thúc và ẩn khỏi trang chủ</p>
            </div>

            <div className="instruction-item">
              <h4>👥 Theo dõi người xem:</h4>
              <p>Số lượng người xem sẽ tự động cập nhật</p>
              <p>Khách hàng có thể chat trực tiếp khi xem stream</p>
            </div>

            <div className="instruction-item">
              <h4>⚠️ Lưu ý quan trọng:</h4>
              <p>• Chỉ admin mới có thể điều khiển stream</p>
              <p>• Stream sẽ tự động hiển thị lúc 18h hàng ngày</p>
              <p>• Chat được giới hạn 300 tin nhắn gần nhất</p>
              <p>• Không cho phép cá cược trong chat</p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="contact-section">
          <h2>📞 Thông Tin Liên Hệ</h2>
          <div className="contact-card">
            <p><strong>Hotline:</strong> <a href="tel:0387683857">0387683857</a></p>
            <p><strong>Địa chỉ:</strong> Phước Lâm, Hoà Hiệp Bắc, Đông Hoà, Phú Yên</p>
            <p><strong>Chuyển khoản:</strong> VietinBank - 100873431535 - Cao Le Anh Cuong</p>
          </div>
        </div>
      </div>

      {/* Admin Live Modal */}
      <AdminLiveModal 
        isOpen={isLiveModalOpen}
        onClose={() => setIsLiveModalOpen(false)}
        streamStatus={streamStatus}
        onStreamStop={() => handleStreamControl('STOP')}
      />
    </div>
  );
};

export default Admin;
