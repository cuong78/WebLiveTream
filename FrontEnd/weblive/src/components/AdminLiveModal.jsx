import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import './AdminLiveModal.css';

const AdminLiveModal = ({ isOpen, onClose, streamStatus, onStreamStop }) => {
  const { connected, messages, sendMessage } = useWebSocket();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const messagesContainerRef = useRef(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start camera when modal opens and stream is live
  useEffect(() => {
    if (isOpen && (streamStatus?.isLive || streamStatus?.live)) {
      startCamera();
    }
    return () => {
      if (!isOpen) {
        stopCamera();
      }
    };
  }, [isOpen, streamStatus?.isLive, streamStatus?.live]);

  const startCamera = useCallback(async () => {
    if (isStreaming) return;
    
    setError('');
    setMessage('Đang khởi động camera...');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });
      
      streamRef.current = stream;
      setIsStreaming(true);
      setRetryCount(0);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setMessage('Camera đã sẵn sàng!');
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
        
        // Handle track ended events
        stream.getTracks().forEach(track => {
          track.addEventListener('ended', () => {
            console.log(`${track.kind} track ended`);
            handleStreamEnd();
          });
        });
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
      });
      streamRef.current = null;
      setIsStreaming(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, []);

  const handleStreamEnd = useCallback(() => {
    setIsStreaming(false);
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    // Auto-retry camera if stream is still live
    if ((streamStatus?.isLive || streamStatus?.live) && retryCount < 3) {
      setRetryCount(prev => prev + 1);
      setMessage(`Camera bị ngắt, đang thử kết nối lại... (${retryCount + 1}/3)`);
      setTimeout(() => {
        startCamera();
      }, 2000);
    } else {
      setError('Camera đã bị ngắt kết nối. Vui lòng bật lại.');
    }
  }, [streamStatus?.isLive, streamStatus?.live, retryCount, startCamera]);

  const handleCameraError = useCallback((error) => {
    setIsStreaming(false);
    let errorMessage = 'Không thể truy cập camera.';
    
    switch (error.name) {
      case 'NotAllowedError':
        errorMessage = 'Vui lòng cho phép truy cập camera và microphone.';
        break;
      case 'NotFoundError':
        errorMessage = 'Không tìm thấy camera hoặc microphone.';
        break;
      case 'NotReadableError':
        errorMessage = 'Camera đang được sử dụng bởi ứng dụng khác.';
        break;
      case 'OverconstrainedError':
        errorMessage = 'Cài đặt camera không được hỗ trợ.';
        break;
      case 'SecurityError':
        errorMessage = 'Lỗi bảo mật khi truy cập camera.';
        break;
      default:
        errorMessage = `Lỗi camera: ${error.message}`;
    }
    
    setError(errorMessage);
  }, []);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMessageClassName = (messageType) => {
    switch (messageType) {
      case 'SYSTEM':
        return 'message system-message';
      case 'ERROR':
        return 'message error-message';
      default:
        return 'message chat-message';
    }
  };

  const handleStopStream = () => {
    stopCamera();
    onStreamStop();
  };

  if (!isOpen) return null;

  return (
    <div className="admin-live-modal-overlay">
      <div className="admin-live-modal">
        <div className="modal-header">
          <h2>🔴 Live Stream - Admin View</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-content">
          {/* Left Panel - Video Preview */}
          <div className="video-panel">
            <div className="video-container">
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted={true}
                controls={false}
                className="admin-live-video"
              />
              
              {!isStreaming && (
                <div className="video-placeholder">
                  <div className="placeholder-content">
                    <div className="camera-icon">📹</div>
                    <p>Đang khởi động camera...</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Stream Info */}
            <div className="stream-info">
              <div className="stream-status">
                <span className={`status-indicator ${(streamStatus?.isLive || streamStatus?.live) ? 'live' : 'offline'}`}>
                  {(streamStatus?.isLive || streamStatus?.live) ? '🔴 ĐANG PHÁT' : '⚫ OFFLINE'}
                </span>
                <span className="viewer-count">👥 {streamStatus?.viewerCount || 0} người xem</span>
              </div>
              
              <div className="stream-details">
                <h4>{streamStatus?.streamTitle}</h4>
                <p>{streamStatus?.streamDescription}</p>
                {streamStatus?.startTime && (
                  <small>Bắt đầu: {new Date(streamStatus.startTime).toLocaleString('vi-VN')}</small>
                )}
              </div>
            </div>
            
            {/* Messages */}
            {error && (
              <div className="alert alert-error">
                <strong>❌ Lỗi:</strong> {error}
              </div>
            )}
            
            {message && (
              <div className="alert alert-success">
                <strong>ℹ️ Thông báo:</strong> {message}
              </div>
            )}
            
            {/* Controls */}
            <div className="stream-controls">
              <button 
                className="control-btn restart-camera"
                onClick={startCamera}
                disabled={isStreaming}
              >
                🔄 Khởi động lại camera
              </button>
              
              <button 
                className="control-btn stop-stream"
                onClick={handleStopStream}
              >
                🛑 Dừng Live Stream
              </button>
            </div>
          </div>
          
          {/* Right Panel - Chat */}
          <div className="chat-panel">
            <div className="chat-header">
              <h3>💬 Chat Trực Tiếp</h3>
              <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
                {connected ? 'Đã kết nối' : 'Đang kết nối...'}
              </div>
            </div>
            
            <div className="chat-messages" ref={messagesContainerRef}>
              {messages.length === 0 ? (
                <div className="no-messages">
                  <p>Chưa có tin nhắn nào</p>
                  <small>Các tin nhắn từ người xem sẽ hiển thị ở đây</small>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className={getMessageClassName(msg.type)}>
                    <div className="message-header">
                      <span className="sender">{msg.sender}</span>
                      <span className="time">{formatTime(msg.timestamp)}</span>
                    </div>
                    <div className="message-content">{msg.content}</div>
                  </div>
                ))
              )}
            </div>
            
            <div className="chat-stats">
              <small>📊 Tổng cộng: {messages.length} tin nhắn</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLiveModal;
