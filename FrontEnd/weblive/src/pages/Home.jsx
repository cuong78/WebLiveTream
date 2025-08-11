import React, { useState } from 'react';
import Header from '../components/Header';
import RealLiveStream from '../components/RealLiveStream';
import Chat from '../components/Chat';
import './Home.css';

const Home = () => {
  const [viewerCount, setViewerCount] = useState(0);

  return (
    <div className="home">
      <Header />
      
      <main className="main-content">
        <div className="container">
          <div className="content-grid">
            {/* Live Stream Section */}
            <div className="stream-section">
              <RealLiveStream onViewerChange={setViewerCount} />
            </div>

            {/* Chat Section */}
            <div className="chat-section">
              <Chat />
            </div>
          </div>

          {/* Contact Information */}
          <div className="contact-section">
            <div className="contact-grid">
              <div className="contact-card">
                <h3>🔗 Kết Nối Đam Mê</h3>
                <div className="contact-info">
                  <div className="phone-contact">
                    <span className="phone-icon">📱</span>
                    <a href="tel:0387683857">0387683857</a>
                  </div>
                </div>
              </div>

              <div className="contact-card">
                <h3>💳 Thông Tin Chuyển Khoản</h3>
                <div className="bank-info">
                  <p><strong>Ngân hàng VietinBank</strong></p>
                  <p>Tên người nhận: <strong>Cao Le Anh Cuong</strong></p>
                  <p>Số tài khoản: <strong>100873431535</strong></p>
                  <button className="copy-btn" onClick={() => navigator.clipboard.writeText('100873431535')}>
                    📋 Sao chép STK
                  </button>
                </div>
              </div>

              <div className="contact-card">
                <h3>⚠️ Quy Định</h3>
                <div className="rules">
                  <p>✅ Xổ Gà Mua Bán Trên Tinh Thần Giao Lưu Vui Vẻ, Lịch Sự Trên Live Chat</p>
                  <p>🚫 Không Để Số Điện Thoại, Không Cá Cược Dưới Mọi Hình Thức</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Videos Section */}
          <div className="videos-section">
            <h2>📹 VIDEO XEM LẠI</h2>
            <p>Nơi lưu trữ các video xổ gà chọi được quay trực tiếp hàng ngày</p>
            
            <div className="videos-grid">
              <div className="video-card">
                <div className="video-thumbnail">
                  <div className="play-icon">▶️</div>
                </div>
                <div className="video-info">
                  <h4>Video Xổ Gà Tối 10/8 – CLB Gà Chọi Anh Cương</h4>
                  <p>10/08/2025</p>
                </div>
              </div>

              <div className="video-card">
                <div className="video-thumbnail">
                  <div className="play-icon">▶️</div>
                </div>
                <div className="video-info">
                  <h4>Video Xổ Gà Sáng 10/8 – CLB Gà Chọi Anh Cương</h4>
                  <p>10/08/2025</p>
                </div>
              </div>

              <div className="video-card">
                <div className="video-thumbnail">
                  <div className="play-icon">▶️</div>
                </div>
                <div className="video-info">
                  <h4>Video Xổ Gà Tối 9/8 – CLB Gà Chọi Anh Cương</h4>
                  <p>09/08/2025</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>CLB Gà Chọi Anh Cương</h3>
              <p>• Xổ gà trực tiếp 18h hàng ngày</p>
              <p>• Giao lưu mua bán gà chọi đi các tỉnh</p>
            </div>

            <div className="footer-section">
              <h3>📞 Liên Hệ</h3>
              <p>Hotline/Zalo: <a href="tel:0387683857">0387683857</a></p>
              <p>📍 Địa chỉ: Phước Lâm, Hoà Hiệp Bắc, Đông Hoà, Phú Yên</p>
            </div>

            <div className="footer-section">
              <h3>💳 Thông Tin Chuyển Khoản</h3>
              <p>Ngân hàng VietinBank</p>
              <p>Tên người nhận: Cao Le Anh Cuong</p>
              <p>Số tài khoản: 100873431535</p>
            </div>

            <div className="footer-section">
              <h3>⚠️ Quy Định</h3>
              <p>• Website CLB Gà Chọi Anh Cương hoạt động với hình thức giải trí, vui lòng không cá độ dưới mọi hình thức vi phạm pháp luật Việt Nam</p>
              <p>• Xổ Gà Mua Bán Trên Tinh Thần Giao Lưu Vui Vẻ, Lịch Sự trên Live Chat</p>
            </div>
          </div>

          <div className="footer-bottom">
            <p>Bản quyền thuộc về CLB Gà Chọi Anh Cương © 2025</p>
            <div className="contact-buttons">
              <a href="tel:0387683857" className="contact-btn call">
                📞 Gọi Ngay
              </a>
              <a href="https://zalo.me/0387683857" target="_blank" rel="noopener noreferrer" className="contact-btn zalo">
                💬 Zalo
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
