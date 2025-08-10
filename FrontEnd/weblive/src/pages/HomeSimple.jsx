import React from 'react';

const Home = () => {
  return (
    <div style={{ 
      backgroundColor: '#1a1a1a', 
      color: 'white', 
      minHeight: '100vh', 
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      <h1 style={{ color: '#ff6b35', marginBottom: '20px' }}>
        CLB Gà Chọi Anh Cương
      </h1>
      <p style={{ fontSize: '18px', marginBottom: '10px' }}>
        🔴 Live Stream sẽ bắt đầu lúc 18h hàng ngày
      </p>
      <p style={{ fontSize: '16px', color: '#ccc' }}>
        📞 Hotline: 0387683857
      </p>
      <p style={{ fontSize: '16px', color: '#ccc' }}>
        📍 Địa chỉ: Phước Lâm, Hoà Hiệp Bắc, Đông Hoà, Phú Yên
      </p>
      <div style={{ marginTop: '30px' }}>
        <a 
          href="/login" 
          style={{ 
            background: '#ff6b35',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '25px',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}
        >
          Đăng nhập Admin
        </a>
      </div>
    </div>
  );
};

export default Home;
