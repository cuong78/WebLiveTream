import React, { useState, useEffect } from 'react';
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

  // Update from WebSocket
  useEffect(() => {
    if (connected && wsStreamStatus) {
      updateFromWebSocket(wsStreamStatus, wsViewerCount);
    }
  }, [wsStreamStatus, wsViewerCount, connected, updateFromWebSocket]);

  // Auto camera management
  useEffect(() => {
    const isLiveStatus = streamStatus?.isLive || streamStatus?.live;
    if (isLiveStatus && !isStreaming) {
      startCamera();
    } else if (!isLiveStatus && isStreaming) {
      stopCamera();
    }
  }, [streamStatus?.isLive, streamStatus?.live, isStreaming, startCamera, stopCamera]);

  const handleStreamControl = async (action) => {
    let title = streamForm.title;
    let description = streamForm.description;
    
    if (action === 'STOP') {
      title = '';
      description = '';
    }

    const result = await controlStream(action, title, description);
    
    if (result.success) {
      // Open modal when starting stream
      if (action === 'START' && (result.data?.isLive || result.data?.live)) {
        setIsLiveModalOpen(true);
      }
      
      // Close modal when stopping stream
      if (action === 'STOP') {
        setIsLiveModalOpen(false);
      }
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

  if (!user) {
    return null;
  }

  return (
    <div className="admin">
      <div className="admin-header">
        <div className="container">
          <div className="header-content">
            <div className="logo-section">
              <img src="/logo.png" alt="CLB Gà Chọi Anh Cương" className="logo" />
              <div className="title-section">
                <h1>CLB Gà Chọi Anh Cương - Admin</h1>
                <p>Quản lý Live Stream</p>
              </div>
            </div>
            
            <div className="user-section">
              <span className="welcome">Xin chào, {user.username}</span>
              <button onClick={handleLogout} className="logout-btn">
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <div className="container">
          {/* Error/Success Messages */}
          {(streamError || cameraError) && (
            <div className="alert alert-error">
              <strong>❌ Lỗi:</strong><br/>
              {streamError || cameraError}
            </div>
          )}

          {message && (
            <div className="alert alert-success">
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

              {/* Camera Preview */}
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
                  <p>✅ Camera đang hoạt động!</p>
                </div>
              )}
            </div>
          </div>

          {/* Stream Controls */}
          <div className="control-section">
            <h2>🎮 Điều Khiển Live Stream</h2>
            
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
                    onClick={() => handleStreamControl('START')}
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
                
                <div className="active-controls">
                  <button
                    onClick={() => setIsLiveModalOpen(true)}
                    className="control-btn modal-btn"
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
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="instructions-section">
            <h2>📋 Hướng Dẫn Sử Dụng</h2>
            <div className="instructions-grid">
              <div className="instruction-item">
                <h4>🎯 Bắt đầu Live Stream:</h4>
                <p>1. Nhập tiêu đề và mô tả cho stream</p>
                <p>2. Nhấn "Bắt đầu Live Stream"</p>
                <p>3. Camera sẽ tự động bật và hiển thị trên trang chủ</p>
              </div>

              <div className="instruction-item">
                <h4>⏹️ Dừng Live Stream:</h4>
                <p>1. Nhấn "Dừng Live Stream"</p>
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
    </div>
  );
};

export default Admin;
