import React from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import './Header.css';

const Header = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      logout();
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <img src="/logo.png" alt="CLB Gà Chọi Anh Cương" className="logo-img" />
            <h1 className="site-title">CLB Gà Chọi Anh Cương</h1>
          </div>
          
          <nav className="nav">
            <div className="contact-info">
              <div className="phone">
                <span className="phone-icon">📱</span>
                <a href="tel:0387683857">0387683857</a>
              </div>
            </div>
            
            {isAuthenticated ? (
              <div className="user-menu">
                <span className="welcome">Xin chào, {user?.username}</span>
                {isAdmin() && (
                  <a href="/admin" className="admin-link">
                    Trang quản trị
                  </a>
                )}
                <button onClick={handleLogout} className="logout-btn">
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <a href="/login" className="login-btn">Đăng nhập</a>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
