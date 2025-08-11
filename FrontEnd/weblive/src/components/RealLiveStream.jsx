import React, { useState, useEffect, useRef } from 'react';
import { liveStreamAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';
import { useCamera } from '../hooks/useCamera';
import { useStreamManager } from '../hooks/useStreamManager';
import webrtcService from '../services/webrtcService';
import MockVideoStream from './MockVideoStream';
import './LiveStream.css';
import './RealLiveStream.css';

const RealLiveStream = ({ onViewerChange }) => {
  const [hasJoined, setHasJoined] = useState(false);
  const [remoteStream, setRemoteStream] = useState(null);
  const [webrtcConnected, setWebrtcConnected] = useState(false);
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

  const remoteVideoRef = useRef(null);

  // Initialize WebRTC
  useEffect(() => {
    const initWebRTC = async () => {
      try {
        await webrtcService.initialize();
        
        // Set callback for remote stream
        webrtcService.setOnRemoteStream((stream) => {
          setRemoteStream(stream);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
          setWebrtcConnected(true);
        });

      } catch (error) {
        console.error('Failed to initialize WebRTC:', error);
      }
    };

    initWebRTC();

    return () => {
      webrtcService.disconnect();
    };
  }, []);

  // Update stream status from WebSocket
  useEffect(() => {
    if (connected && wsStreamStatus) {
      updateFromWebSocket(wsStreamStatus, wsViewerCount);
    }
  }, [wsStreamStatus, wsViewerCount, connected, updateFromWebSocket]);

  // Update viewer count for parent component
  useEffect(() => {
    if (onViewerChange) {
      onViewerChange(streamStatus?.viewerCount || wsViewerCount || 0);
    }
  }, [streamStatus?.viewerCount, wsViewerCount, onViewerChange]);

  // Admin camera and WebRTC management
  useEffect(() => {
    const isLiveStatus = streamStatus?.isLive || streamStatus?.live;
    
    if (isAdmin()) {
      if (isLiveStatus && !isStreaming) {
        handleAdminStartStream();
      } else if (!isLiveStatus && isStreaming) {
        handleAdminStopStream();
      }
    } else {
      // Viewer - join WebRTC stream when live
      if (isLiveStatus && !hasJoined) {
        handleViewerJoinStream();
      } else if (!isLiveStatus && hasJoined) {
        handleViewerLeaveStream();
      }
    }
  }, [streamStatus?.isLive, streamStatus?.live, isAdmin, isStreaming]);

  // Admin starts camera and WebRTC streaming
  const handleAdminStartStream = async () => {
    try {
      const result = await startCamera();
      if (result.success && videoRef.current?.srcObject) {
        // Start WebRTC streaming with camera stream
        await webrtcService.startStream(videoRef.current.srcObject);
        console.log('📹 Admin started WebRTC streaming');
      }
    } catch (error) {
      console.error('❌ Error starting admin stream:', error);
    }
  };

  // Admin stops camera and WebRTC streaming
  const handleAdminStopStream = () => {
    webrtcService.stopStream();
    stopCamera();
    console.log('🛑 Admin stopped WebRTC streaming');
  };

  // Viewer joins WebRTC stream
  const handleViewerJoinStream = async () => {
    try {
      await webrtcService.joinAsViewer();
      await liveStreamAPI.joinAsViewer();
      setHasJoined(true);
      console.log('👀 Viewer joined WebRTC stream');
    } catch (error) {
      console.error('❌ Error joining stream:', error);
    }
  };

  // Viewer leaves WebRTC stream
  const handleViewerLeaveStream = async () => {
    try {
      if (hasJoined) {
        await liveStreamAPI.leaveAsViewer();
        setHasJoined(false);
      }
      setRemoteStream(null);
      setWebrtcConnected(false);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      console.log('👋 Viewer left stream');
    } catch (error) {
      console.error('❌ Error leaving stream:', error);
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasJoined) {
        navigator.sendBeacon(
          `${window.location.origin}/api/livestream/viewer/leave`,
          new FormData()
        );
      }
      if (isAdmin()) {
        webrtcService.stopStream();
      }
      stopCamera();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && hasJoined) {
        handleViewerLeaveStream();
      } else if (document.visibilityState === 'visible' && streamStatus?.isLive && !hasJoined && !isAdmin()) {
        handleViewerJoinStream();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      handleViewerLeaveStream();
    };
  }, [hasJoined, streamStatus?.isLive, isAdmin]);

  if (loading) {
    return (
      <div className="stream-container loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin stream...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stream-container">
      {/* Error Messages */}
      {(streamError || cameraError) && (
        <div className="alert error">
          <p><strong>❌ Lỗi:</strong> {streamError || cameraError}</p>
        </div>
      )}

      {/* Admin Camera Preview */}
      {isAdmin() && (streamStatus?.isLive || streamStatus?.live) && (
        <div className="admin-camera-section">
          <h3>📹 Camera Admin (Đang phát trực tiếp)</h3>
          <div className="camera-container">
            {isStreaming ? (
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted={true}
                controls={false}
                className="admin-camera-preview"
              />
            ) : (
              <div className="camera-placeholder">
                <p>Đang khởi động camera...</p>
              </div>
            )}
          </div>
          <div className="camera-controls">
            <button 
              onClick={handleAdminStartStream} 
              disabled={isStreaming}
              className="btn primary"
            >
              {isStreaming ? '✅ Đang phát trực tiếp' : '📹 Bắt đầu phát'}
            </button>
            {isStreaming && (
              <button 
                onClick={handleAdminStopStream} 
                className="btn secondary"
              >
                ⏹️ Dừng phát
              </button>
            )}
          </div>
        </div>
      )}

      {/* Video Stream for Viewers */}
      <div className="video-section">
        {!isAdmin() && (streamStatus?.isLive || streamStatus?.live) ? (
          <div className="real-video-container">
            <h3>🔴 Live Stream - Video thực</h3>
            {webrtcConnected && remoteStream ? (
              <video 
                ref={remoteVideoRef}
                autoPlay 
                playsInline 
                controls={true}
                className="remote-video"
                style={{
                  width: '100%',
                  maxWidth: '800px',
                  height: 'auto',
                  backgroundColor: '#000',
                  borderRadius: '8px'
                }}
              />
            ) : (
              <div className="video-loading">
                <div className="loading-spinner"></div>
                <p>Đang kết nối với admin...</p>
                <small>WebRTC Status: {webrtcConnected ? 'Connected' : 'Connecting...'}</small>
              </div>
            )}
          </div>
        ) : (
          <MockVideoStream 
            isLive={(streamStatus?.isLive || streamStatus?.live) || false}
            streamTitle={streamStatus?.streamTitle}
            streamDescription={streamStatus?.streamDescription}
            startTime={streamStatus?.startTime}
          />
        )}
      </div>

      {/* Stream Stats */}
      {(streamStatus?.isLive || streamStatus?.live) && (
        <div className="stream-stats">
          <div className="stat-item">
            <span className="label">👥 Người xem:</span>
            <span className="value">{streamStatus.viewerCount || 0}</span>
          </div>
          <div className="stat-item">
            <span className="label">⏱️ Bắt đầu:</span>
            <span className="value">
              {streamStatus.startTime ? new Date(streamStatus.startTime).toLocaleTimeString('vi-VN') : 'N/A'}
            </span>
          </div>
          <div className="stat-item">
            <span className="label">📶 Kết nối:</span>
            <span className={`value ${connected ? 'connected' : 'disconnected'}`}>
              {connected ? 'WebSocket' : 'HTTP Polling'}
            </span>
          </div>
          {!isAdmin() && (
            <div className="stat-item">
              <span className="label">🎥 Video:</span>
              <span className={`value ${webrtcConnected ? 'connected' : 'disconnected'}`}>
                {webrtcConnected ? 'WebRTC Connected' : 'Connecting...'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RealLiveStream;
