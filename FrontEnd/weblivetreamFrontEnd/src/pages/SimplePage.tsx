import React, { useState } from 'react';
import type { Stream, VideoRecord, ChatMessage } from '../types';
import './SimplePage.css';

const SimplePage: React.FC = () => {
  const [streams] = useState<Stream[]>([
    {
      id: '1',
      title: 'Xổ gà Server HD1',
      serverName: 'HD1',
      url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
      isLive: true,
      viewerCount: 156,
      thumbnail: '',
      scheduledTime: new Date('2025-08-10T18:00:00')
    },
    {
      id: '2',
      title: 'Xổ gà Server HD2',
      serverName: 'HD2',
      url: '',
      isLive: false,
      viewerCount: 0,
      thumbnail: ''
    },
    {
      id: '3',
      title: 'Xổ gà Server HD3',
      serverName: 'HD3',
      url: '',
      isLive: true,
      viewerCount: 89,
      thumbnail: ''
    },
    {
      id: '4',
      title: 'Xổ gà Server HD4',
      serverName: 'HD4',
      url: '',
      isLive: false,
      viewerCount: 0,
      thumbnail: ''
    },
    {
      id: '5',
      title: 'Xổ gà Server HD5',
      serverName: 'HD5',
      url: '',
      isLive: false,
      viewerCount: 0,
      thumbnail: ''
    }
  ]);

  const [activeStreamId, setActiveStreamId] = useState<string>('1');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [showUsernameInput, setShowUsernameInput] = useState(true);

  const [videoArchive] = useState<VideoRecord[]>([
    {
      id: '1',
      title: 'Video Xổ Gà Sáng 10/8 – CLB Gà Chọi Cậu Thanh',
      date: new Date('2025-08-10T08:00:00'),
      duration: 3600,
      thumbnail: 'https://via.placeholder.com/320x180/374151/9CA3AF?text=Video+1',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      description: 'Trận đấu gà hấp dẫn buổi sáng với nhiều trận đấu kịch tính'
    },
    {
      id: '2',
      title: 'Video Xổ Gà Tối 9/8 – CLB Gà Chọi Cậu Thanh',
      date: new Date('2025-08-09T18:00:00'),
      duration: 4200,
      thumbnail: 'https://via.placeholder.com/320x180/374151/9CA3AF?text=Video+2',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      description: 'Buổi chiều với những trận đấu gay cấn và kịch tính'
    }
  ]);

  const activeStream = streams.find(stream => stream.id === activeStreamId);

  const handleStreamSelect = (streamId: string) => {
    setActiveStreamId(streamId);
    setChatMessages([]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && username.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        username: username,
        message: newMessage.trim(),
        timestamp: new Date(),
        type: 'normal'
      };
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setShowUsernameInput(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <div className="logo">
                <span>🐓</span>
              </div>
              <div className="header-text">
                <h1>CLB Gà Chọi Cậu Thanh</h1>
                <p>Xổ gà trực tiếp 18h hàng ngày</p>
              </div>
            </div>
            
            <div className="header-right">
              {activeStream?.isLive && (
                <div className="live-badge">
                  <div className="live-dot"></div>
                  <span>TRỰC TIẾP</span>
                </div>
              )}
              
              <div className="contact-buttons">
                <a href="tel:0393835679" className="btn btn-green">
                  📞 0393835679
                </a>
                <a href="https://zalo.me/0393835679" target="_blank" rel="noopener noreferrer" className="btn btn-blue">
                  💬 Zalo
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          {/* Server Selection */}
          <section className="server-selection">
            <h3>🎬 Đổi Server:</h3>
            <div className="server-grid">
              {streams.map((stream) => (
                <button
                  key={stream.id}
                  onClick={() => handleStreamSelect(stream.id)}
                  className={`server-btn ${activeStreamId === stream.id ? 'active' : ''}`}
                >
                  {stream.isLive && <div className="live-indicator"></div>}
                  
                  <div className="server-name">{stream.serverName}</div>
                  
                  <div className="server-status">
                    {stream.isLive ? (
                      <span className="status-live">LIVE</span>
                    ) : (
                      <span className="status-offline">OFFLINE</span>
                    )}
                  </div>
                  
                  {stream.isLive && stream.viewerCount > 0 && (
                    <div className="viewer-count">
                      👥 {stream.viewerCount.toLocaleString()}
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            <div className="reload-section">
              <button onClick={() => window.location.reload()} className="btn btn-secondary">
                🔄 LOAD LẠI TRANG
              </button>
            </div>
            
            <div className="schedule-info">
              <p>⏰ Lịch phát sóng: 18h00 hàng ngày</p>
              <p>📍 Địa điểm: Phước Lâm, Hoà Hiệp Bắc, Đông Hoà, Phú Yên</p>
            </div>
          </section>

          {/* Main Content */}
          <section className="content-grid">
            {/* Video Player */}
            <div className="video-section">
              {activeStream ? (
                <div className="video-container">
                  {activeStream.url ? (
                    <video
                      controls
                      autoPlay={activeStream.isLive}
                      poster={activeStream.thumbnail}
                      className="video-player"
                    >
                      <source src={activeStream.url} type="video/mp4" />
                      Trình duyệt của bạn không hỗ trợ video.
                    </video>
                  ) : (
                    <div className="video-placeholder">
                      <div className="placeholder-content">
                        <div className="placeholder-icon">📺</div>
                        <p>Server đang bảo trì</p>
                        <p>Vui lòng thử server khác</p>
                      </div>
                    </div>
                  )}
                  
                  {activeStream.isLive && (
                    <div className="live-overlay">
                      <span>LIVE</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="video-placeholder">
                  <div className="placeholder-content">
                    <div className="placeholder-icon">📺</div>
                    <p>Không có stream nào được chọn</p>
                  </div>
                </div>
              )}

              {/* Stream Info */}
              {activeStream && (
                <div className="stream-info">
                  <h2>{activeStream.title}</h2>
                  <div className="stream-meta">
                    <div className="status">
                      {activeStream.isLive ? (
                        <>
                          <div className="status-dot live"></div>
                          <span className="status-text live">Đang phát trực tiếp</span>
                        </>
                      ) : (
                        <>
                          <div className="status-dot offline"></div>
                          <span className="status-text">Không trực tiếp</span>
                        </>
                      )}
                    </div>
                    {activeStream.viewerCount > 0 && (
                      <div className="viewer-info">
                        <span>👥</span>
                        <span>{activeStream.viewerCount.toLocaleString()} người xem</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Chat */}
            <div className="chat-section">
              <div className="chat-header">
                <h3>💬 Chat trực tiếp</h3>
                <div className="connection-status">
                  <div className="connection-dot connected"></div>
                  <span>Đã kết nối</span>
                </div>
              </div>

              {showUsernameInput ? (
                <div className="username-form">
                  <h4>Nhập tên của bạn để chat</h4>
                  <form onSubmit={handleUsernameSubmit}>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Tên của bạn..."
                      className="form-input"
                      maxLength={20}
                      required
                    />
                    <button type="submit" className="btn btn-blue">
                      Bắt đầu chat
                    </button>
                  </form>
                </div>
              ) : (
                <>
                  <div className="chat-messages">
                    {chatMessages.length === 0 ? (
                      <div className="empty-chat">
                        <p>Chưa có tin nhắn nào</p>
                        <p>Hãy là người đầu tiên gửi tin nhắn!</p>
                      </div>
                    ) : (
                      chatMessages.map((message) => (
                        <div key={message.id} className="chat-message">
                          <div className="message-header">
                            <span className="message-time">{formatTime(message.timestamp)}</span>
                            <span className="message-username">{message.username}:</span>
                          </div>
                          <div className="message-content">{message.message}</div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="chat-input-section">
                    <div className="current-user">
                      Đang chat với tên: <span className="username">{username}</span>
                      <button 
                        onClick={() => setShowUsernameInput(true)}
                        className="change-name-btn"
                      >
                        (đổi)
                      </button>
                    </div>
                    
                    <form onSubmit={handleSendMessage} className="chat-form">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                        className="form-input"
                        maxLength={200}
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="btn btn-blue"
                      >
                        Gửi
                      </button>
                    </form>
                    
                    <div className="chat-rules">
                      <p><strong>⚠️ Quy định chat:</strong></p>
                      <p>• Không cá cược, chửi thề</p>
                      <p>• Không để số điện thoại</p>
                      <p>• Vi phạm sẽ bị khóa nick</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Video Archive */}
          <section className="video-archive">
            <div className="archive-header">
              <h3>📹 VIDEO XEM LẠI</h3>
              <span className="video-count">{videoArchive.length} video</span>
            </div>

            <div className="video-grid">
              {videoArchive.map((video) => (
                <div key={video.id} className="video-card">
                  <div className="video-thumbnail">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23374151'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='%239CA3AF' text-anchor='middle' dy='.3em'%3E📹%3C/text%3E%3C/svg%3E";
                      }}
                    />
                    
                    <div className="video-overlay">
                      <div className="play-button">
                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="duration-badge">
                      {formatDuration(video.duration)}
                    </div>
                  </div>

                  <div className="video-info">
                    <h4>{video.title}</h4>
                    <p className="video-date">{formatDate(video.date)}</p>
                    {video.description && (
                      <p className="video-description">{video.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Footer Info */}
          <footer className="footer">
            <div className="footer-grid">
              <div className="footer-section">
                <h3>📞 Thông tin liên hệ</h3>
                <div className="contact-info">
                  <p>Hotline/Zalo: <span className="highlight">0393835679</span></p>
                  <p>Địa chỉ: Phước Lâm, Hoà Hiệp Bắc, Đông Hoà, Phú Yên</p>
                  <div className="contact-links">
                    <a href="https://zalo.me/0393835679" className="btn btn-blue">Zalo</a>
                    <a href="https://zalo.me/g/pfyfcy269" className="btn btn-blue">Nhóm Zalo</a>
                  </div>
                </div>
              </div>

              <div className="footer-section">
                <h3>💳 Thông tin chuyển khoản</h3>
                <div className="payment-info">
                  <p>Ngân hàng: <span className="highlight">Vietinbank</span></p>
                  <p>Tên người nhận: <span className="highlight">Lê Duy Thanh</span></p>
                  <p>Số tài khoản: <span className="highlight">0393835679</span></p>
                </div>
              </div>

              <div className="footer-section">
                <h3>⚠️ Quy định</h3>
                <div className="rules">
                  <p>✅ Xổ Gà Mua Bán Trên Tinh Thần Giao Lưu Vui Vẻ, Lịch Sự</p>
                  <p>🚫 Không Để Số Điện Thoại</p>
                  <p>🚫 Không Cá Cược Dưới Mọi Hình Thức</p>
                  <p className="warning">⛔ CẤM CÁ CƯỢC, CHỬI THỀ, KHOÁ NICK!</p>
                </div>
              </div>
            </div>

            <div className="footer-bottom">
              <p>Bản quyền thuộc về CLB Gà Chọi Cậu Thanh © 2025</p>
              <p>Website hoạt động với hình thức giải trí, vui lòng không cá độ dưới mọi hình thức vi phạm pháp luật Việt Nam</p>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default SimplePage;
