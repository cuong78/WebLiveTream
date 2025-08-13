import React from 'react';
import './index.css';
import { useNavigate } from 'react-router-dom';
import ChatComponent from './components/ChatComponent';

function App() {
  const today = new Date();
  const d = today.getDate().toString().padStart(2, '0');
  const m = (today.getMonth() + 1).toString().padStart(2, '0');
  const y = today.getFullYear().toString();
  const navigate = useNavigate();

  return (
    <div>
      <header className="navbar">
        <div className="navbar-inner container">
          <div className="brand">
            <img src="/vite.svg" alt="logo" />
            <span>Gà Chọi Tiêu Phong</span>
          </div>
          <button
            style={{
              marginLeft: 'auto',
              padding: '8px 24px',
              fontSize: '1rem',
              backgroundColor: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
            onClick={() => navigate('/login')}
          >
            Đăng nhập
          </button>
        </div>
      </header>

      <main className="container">
        <section className="card">
          <div className="title">Xổ gà Server HD1 trực tiếp 18h30 ngày {d}/{m}/{y}</div>
          <div className="pill-row">
            <span className="pill">Xem ➡️</span>
            <span className="pill"><span className="dot-live" />HD1</span>
            <span className="pill"><span className="dot-live" />HD2</span>
            <span className="pill"><span className="dot-live" />HD3</span>
          </div>
          <div className="video-wrapper">
            <img className="thumb" src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop" alt="live" />
          </div>

          <div className="cta-row">
            <button className="btn btn-danger">LOAD LẠI TRANG</button>
            <button className="btn btn-primary">📱 0345357695</button>
          </div>
        </section>

        <div className="notice"><span className="icon">⛔</span>CẤM CÁ CƯỢC, CHỬI THỀ, KHOÁ NICK!</div>

        <section className="chat">
          <ChatComponent />
        </section>

        <h3 className="section-title">Liên hệ CLB Gà Chọi Tiêu Phong</h3>
        <section className="info-card">
          <div className="title" style={{fontSize:18, marginBottom:8}}>0345 357 695</div>
          <div className="info-item">Giao Lưu Mua Bán Toàn Quốc</div>
          <div className="info-item">Địa chỉ: Khu Phố Phú Thứ, Thị Trấn Phú Thứ, Huyện Tây Hòa, Tỉnh Phú Yên</div>
        </section>

        <h3 className="section-title">Thông tin chuyển khoản</h3>
        <section className="info-card">
          <div className="info-item">Ngân hàng AGRIBANK</div>
          <div className="info-item">Tên người nhận: CAO THỊ HOA LÀI</div>
          <div className="info-item">Số tài khoản: <strong>4610231000110</strong></div>
          <button className="copy-btn" onClick={() => navigator.clipboard.writeText('4610231000110')}>Sao chép STK</button>
        </section>

        <h3 className="section-title">Quy định</h3>
        <section className="info-card">
          <div className="rule"><span className="emoji">☑️</span><div>Xổ Gà Mua Bán Trên Tinh Thần Giao Lưu Vui Vẻ, Lịch Sự Trên Live Chat</div></div>
          <div className="rule"><span className="emoji">🚫</span><div>Không Để Số Điện Thoại, Không Cá Cược Dưới Mọi Hình Thức</div></div>
          <button className="btn btn-primary" style={{marginTop:8}}>Chat Ngay</button>
        </section>

        <h3 className="section-title">Video xổ gà hàng ngày</h3>
        <section className="video-grid">
          {[12,11,10].map((day) => (
            <article className="video-card" key={day}>
              <img src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop" alt="video" />
              <div className="meta">
                <div className="title" style={{fontSize:18}}>Video Ngày {day}/8 – CLB Gà Chọi Tiêu Phong</div>
                <div className="info-item">{String(day).padStart(2,'0')}/08/{y}</div>
              </div>
            </article>
          ))}
        </section>

        <footer className="footer">
          Website CLB Gà Chọi Tiêu Phong hoạt động với hình thức giải trí, vui lòng không cá độ.
        </footer>
      </main>

      <div className="fab-group">
        <div className="fab phone">📞</div>
        <div className="fab zalo">Zalo</div>
        <div className="fab vip">VIP

        </div>
      </div>
    </div>
  )
}

export default App
