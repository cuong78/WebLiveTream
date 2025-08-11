// Mock Video Stream Component for Testing
import React, { useEffect, useState } from 'react';
import './MockVideoStream.css';

const MockVideoStream = ({ isLive, streamTitle, streamDescription, startTime }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!isLive) return;

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [isLive]);

  const getDuration = () => {
    if (!startTime) return '00:00:00';
    const start = new Date(startTime);
    const now = new Date();
    const diff = Math.floor((now - start) / 1000);
    
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isLive) {
    return (
      <div className="mock-video-container offline">
        <div className="offline-content">
          <div className="tv-icon">📺</div>
          <h3>Live Stream sẽ bắt đầu lúc 18h hàng ngày</h3>
          <p>CLB Gà Chọi Anh Cương</p>
          <div className="schedule-info">
            <div className="schedule-item">
              <span className="icon">🕕</span>
              <span>Thời gian: 18:00 - 20:00</span>
            </div>
            <div className="schedule-item">
              <span className="icon">📍</span>
              <span>Địa điểm: Phước Lâm, Hoà Hiệp Bắc, Đông Hoà, Phú Yên</span>
            </div>
            <div className="schedule-item">
              <span className="icon">📞</span>
              <span>Liên hệ: 0387683857</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mock-video-container live">
      {/* Live Stream Simulation */}
      <div className="video-simulation">
        <div className="live-indicator">
          <span className="live-dot"></span>
          <span className="live-text">ĐANG PHÁT</span>
        </div>
        
        <div className="stream-overlay">
          <div className="stream-info">
            <h3 className="stream-title">{streamTitle}</h3>
            <p className="stream-description">{streamDescription}</p>
          </div>
          
          <div className="stream-stats">
            <div className="stat">
              <span className="stat-label">Thời lượng:</span>
              <span className="stat-value">{getDuration()}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Chất lượng:</span>
              <span className="stat-value">HD 720p</span>
            </div>
          </div>
        </div>

        {/* Animated background to simulate video */}
        <div className="video-background">
          <div className="animated-bg"></div>
          <div className="video-placeholder">
            <div className="rooster-animation">🐓</div>
            <p>Video simulation - Admin đang phát trực tiếp</p>
            <small>Trong môi trường thực tế, đây sẽ là video stream từ camera admin</small>
          </div>
        </div>
      </div>

      {/* Control Hint for Demo */}
      <div className="demo-hint">
        <p>💡 <strong>Demo Mode:</strong> Đây là video mô phỏng</p>
        <small>Stream Status: {isLive ? '🔴 LIVE' : '⭕ OFFLINE'}</small>
        <br />
        <small>Title: {streamTitle || 'No title'}</small>
        <br />
        <small>Trong môi trường thực tế, đây sẽ là video stream từ camera admin</small>
      </div>
    </div>
  );
};

export default MockVideoStream;
