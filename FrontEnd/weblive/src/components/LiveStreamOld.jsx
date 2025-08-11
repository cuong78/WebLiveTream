import React, { useState, useEffect, useCallback } from 'react';
import { liveStreamAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';
import { useCamera } from '../hooks/useCamera';
import { useStreamManager } from '../hooks/useStreamManager';
import MockVideoStream from './MockVideoStream';
import './LiveStream.css';

const LiveStream = ({ onViewerChange }) => {
  const [hasJoined, setHasJoined] = useState(false);
  const { isAdmin } = useAuth();
  const { connected, streamStatus: wsStreamStatus, viewerCount: wsViewerCount } = useWebSocket();
  const { 
    isStreaming, 
    error: cameraError, 
    videoRef, 
    startCamera, 
    stopCamera 
  } = useCamera();
  const {
    streamStatus,
    loading,
    error: streamError,
    updateFromWebSocket
  } = useStreamManager();

  // Optimized status fetching with fallback when WebSocket disabled
  useEffect(() => {
    fetchStreamStatus();
    // Increased polling frequency since WebSocket is disabled
    const interval = setInterval(fetchStreamStatus, 5000); // 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Update stream status from WebSocket if available, otherwise use HTTP polling
  useEffect(() => {
    if (connected && wsStreamStatus) {
      setStreamStatus(prevStatus => ({
        ...prevStatus,
        ...wsStreamStatus,
        viewerCount: wsViewerCount || prevStatus?.viewerCount || 0
      }));
      setLoading(false);
    }
  }, [wsStreamStatus, wsViewerCount, connected]);

  // Optimized camera management for admin
  useEffect(() => {
    if (isAdmin() && streamStatus?.isLive && !isStreaming) {
      startCamera();
    } else if (isAdmin() && !streamStatus?.isLive && isStreaming) {
      stopCamera();
    }
  }, [streamStatus?.isLive, isAdmin, isStreaming]);

  const startCamera = useCallback(async () => {
    // Prevent multiple camera access attempts
    if (isStreaming || streamRef.current) {
      console.log('Camera already active');
      return;
    }

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
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
        setRetryCount(0);
        
        // Monitor stream health
        stream.getTracks().forEach(track => {
          track.addEventListener('ended', () => {
            console.log(`${track.kind} track ended`);
            handleStreamEnd();
          });
        });
      }
    } catch (error) {
      console.error('Camera access failed:', error);
      handleCameraError(error);
    }
  }, [isStreaming]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log(`Stopped ${track.kind} track`);
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
    if (streamStatus?.isLive && isAdmin() && retryCount < 3) {
      setRetryCount(prev => prev + 1);
      setTimeout(() => {
        startCamera();
      }, 2000);
    }
  }, [streamStatus?.isLive, isAdmin, retryCount, startCamera]);

  const handleCameraError = useCallback((error) => {
    console.error('Camera error:', error);
    setIsStreaming(false);
    
    // Show user-friendly error messages
    let errorMessage = 'Không thể truy cập camera.';
    if (error.name === 'NotAllowedError') {
      errorMessage = 'Vui lòng cho phép truy cập camera và microphone.';
    } else if (error.name === 'NotFoundError') {
      errorMessage = 'Không tìm thấy camera hoặc microphone.';
    } else if (error.name === 'NotReadableError') {
      errorMessage = 'Camera đang được sử dụng bởi ứng dụng khác.';
    }
    
    // Only show alert for admin
    if (isAdmin()) {
      alert(errorMessage);
    }
  }, [isAdmin]);

  const fetchStreamStatus = useCallback(async () => {
    // Always fetch since WebSocket is disabled temporarily
    try {
      const response = await liveStreamAPI.getStatus();
      const statusData = response.data.data || response.data;
      setStreamStatus(statusData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stream status:', error);
      
      // Fallback: Show offline status
      setStreamStatus({
        isLive: false,
        streamTitle: null,
        streamDescription: null,
        viewerCount: 0,
        startTime: null
      });
      setLoading(false);
    }
  }, []);

  const handleJoinStream = useCallback(async () => {
    if (!hasJoined && streamStatus?.isLive) {
      try {
        await liveStreamAPI.joinAsViewer();
        setHasJoined(true);
        console.log('Joined stream as viewer');
      } catch (error) {
        console.error('Error joining stream:', error);
      }
    }
  }, [hasJoined, streamStatus?.isLive]);

  const handleLeaveStream = useCallback(async () => {
    if (hasJoined) {
      try {
        await liveStreamAPI.leaveAsViewer();
        setHasJoined(false);
        console.log('Left stream');
      } catch (error) {
        console.error('Error leaving stream:', error);
      }
    }
  }, [hasJoined]);

  // Auto join/leave stream based on status
  useEffect(() => {
    if (streamStatus?.isLive && !hasJoined && !isAdmin()) {
      handleJoinStream();
    } else if (!streamStatus?.isLive && hasJoined) {
      handleLeaveStream();
    }
  }, [streamStatus?.isLive, hasJoined, isAdmin, handleJoinStream, handleLeaveStream]);

  // Cleanup on component unmount
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasJoined) {
        navigator.sendBeacon(
          `${window.location.origin}/api/livestream/viewer/leave`,
          new FormData()
        );
      }
      stopCamera();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && hasJoined) {
        handleLeaveStream();
      } else if (document.visibilityState === 'visible' && streamStatus?.isLive && !hasJoined && !isAdmin()) {
        handleJoinStream();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (hasJoined) {
        handleLeaveStream();
      }
      stopCamera();
    };
  }, [hasJoined, streamStatus?.isLive, isAdmin, handleJoinStream, handleLeaveStream, stopCamera]);

  if (loading) {
    return (
      <div className="stream-container">
        <div className="stream-loading">
          <div className="loading-spinner"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!streamStatus?.isLive) {
    return (
      <div className="stream-container">
        <div className="stream-offline">
          <div className="offline-content">
            <div className="offline-icon">📺</div>
            <h2>Live Stream sẽ bắt đầu lúc 18h hàng ngày</h2>
            <p>CLB Gà Chọi Anh Cương</p>
            <div className="offline-info">
              <p>🕕 Thời gian: 18:00 - 20:00</p>
              <p>📍 Địa điểm: Phước Lâm, Hoà Hiệp Bắc, Đông Hoà, Phú Yên</p>
              <p>📞 Liên hệ: 0387683857</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stream-container">
      <div className="stream-header">
        <div className="stream-title">
          <h2>{streamStatus.streamTitle}</h2>
          <div className="live-indicator">
            <span className="live-dot"></span>
            TRỰC TIẾP
          </div>
        </div>
        <div className="stream-info">
          <span className="viewer-count">
            👥 {wsViewerCount || streamStatus?.viewerCount || 0} người xem
          </span>
          <span className="start-time">
            🕐 Bắt đầu: {streamStatus?.startTime ? 
              new Date(streamStatus.startTime).toLocaleTimeString('vi-VN') : 
              'Chưa xác định'}
          </span>
          {connected && (
            <span className="connection-status live">
              🟢 Kết nối trực tiếp
            </span>
          )}
        </div>
      </div>

      <div className="stream-player">
        {isAdmin() ? (
          <div className="admin-video-container">
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted={false}
              className="admin-video"
            />
            <div className="admin-controls">
              <div className="camera-status">
                {isStreaming ? (
                  <span className="status-indicator live">🔴 Đang phát trực tiếp</span>
                ) : (
                  <span className="status-indicator offline">⚫ Camera chưa bật</span>
                )}
              </div>
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
        ) : (
          // Viewer's video display - Mock stream for testing
          <div className="viewer-video-container">
            <div className="mock-video-stream">
              <div className="mock-video-content">
                <div className="video-placeholder">
                  <div className="streaming-icon">📹</div>
                  <h3>CLB Gà Chọi Anh Cương</h3>
                  <p>🔴 ĐANG PHÁT TRỰC TIẾP</p>
                  <p className="stream-description">{streamStatus?.streamDescription}</p>
                  <div className="stream-stats">
                    <span>👥 {wsViewerCount || streamStatus?.viewerCount || 0} người xem</span>
                    <span>⏰ {streamStatus?.startTime ? 
                      `Bắt đầu ${new Date(streamStatus.startTime).toLocaleTimeString('vi-VN')}` : 
                      'Đang phát'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mock-video-overlay">
                <div className="live-badge">🔴 LIVE</div>
                <div className="quality-indicator">HD 720p</div>
              </div>
            </div>
            <div className="viewer-notice">
              <p>📺 <strong>Thông báo:</strong> Đây là giao diện test. Video thực sẽ hiển thị khi triển khai lên server với streaming service.</p>
              <p>🎯 <strong>Tính năng hiện có:</strong> Chat trực tiếp, thống kê người xem, thông báo real-time</p>
              <div className="tech-notice">
                <p><strong>📱 Hướng dẫn xem trên nhiều thiết bị:</strong></p>
                <ul>
                  <li>✅ Mở tab mới trên cùng trình duyệt</li>
                  <li>✅ Mở trên điện thoại khác (cùng WiFi)</li>
                  <li>✅ Chia sẻ link cho bạn bè xem cùng</li>
                  <li>⚠️ Cần streaming server (WebRTC/RTMP) để xem video thật</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        
        <div className="stream-controls">
          <div className="server-selector">
            <span>Đổi Server:</span>
            <button className="server-btn active">HD1</button>
            <button className="server-btn">HD2</button>
            <button className="server-btn">HD3</button>
            <button className="server-btn">HD4</button>
            <button className="server-btn">HD5</button>
          </div>
          
          <button className="reload-btn" onClick={fetchStreamStatus}>
            🔄 LOAD LẠI TRANG
          </button>
        </div>
      </div>

      <div className="stream-notice">
        <h3>⛔ CẤM CÁ CƯỢC, CHỬI THỀ, KHOÁ NICK!</h3>
      </div>
    </div>
  );
};

export default LiveStream;
