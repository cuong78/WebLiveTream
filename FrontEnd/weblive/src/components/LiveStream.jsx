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

  // Update stream status from WebSocket if available
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

  // Auto camera management for admin
  useEffect(() => {
    const isLiveStatus = streamStatus?.isLive || streamStatus?.live;
    if (isAdmin() && isLiveStatus && !isStreaming) {
      startCamera();
    } else if (isAdmin() && !isLiveStatus && isStreaming) {
      stopCamera();
    }
  }, [streamStatus?.isLive, streamStatus?.live, isAdmin, isStreaming, startCamera, stopCamera]);

  // Join/leave stream handlers
  const handleJoinStream = useCallback(async () => {
    const isLiveStatus = streamStatus?.isLive || streamStatus?.live;
    if (!hasJoined && isLiveStatus) {
      try {
        await liveStreamAPI.joinAsViewer();
        setHasJoined(true);
        console.log('Joined stream as viewer');
      } catch (error) {
        console.error('Error joining stream:', error);
      }
    }
  }, [hasJoined, streamStatus?.isLive, streamStatus?.live]);

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
    const isLiveStatus = streamStatus?.isLive || streamStatus?.live;
    if (isLiveStatus && !hasJoined && !isAdmin()) {
      handleJoinStream();
    } else if (!isLiveStatus && hasJoined) {
      handleLeaveStream();
    }
  }, [streamStatus?.isLive, streamStatus?.live, hasJoined, isAdmin, handleJoinStream, handleLeaveStream]);

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
      handleLeaveStream();
    };
  }, [hasJoined, handleLeaveStream, handleJoinStream, streamStatus?.isLive, isAdmin, stopCamera]);

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
          <h3>📹 Camera Admin</h3>
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
              onClick={startCamera} 
              disabled={isStreaming}
              className="btn primary"
            >
              {isStreaming ? '✅ Camera hoạt động' : '📹 Bật Camera'}
            </button>
            {isStreaming && (
              <button 
                onClick={stopCamera} 
                className="btn secondary"
              >
                ⏹️ Tắt Camera
              </button>
            )}
          </div>
        </div>
      )}

      {/* Video Stream for Viewers */}
      <div className="video-section">
        <MockVideoStream 
          isLive={(streamStatus?.isLive || streamStatus?.live) || false}
          streamTitle={streamStatus?.streamTitle}
          streamDescription={streamStatus?.streamDescription}
          startTime={streamStatus?.startTime}
        />
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
              {connected ? 'Trực tiếp' : 'HTTP Polling'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveStream;
