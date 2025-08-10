import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin()) {
        navigate('/admin');
      } else {
        navigate(from);
      }
    }
  }, [isAuthenticated, isAdmin, navigate, from]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.username, formData.password);
      
      if (result.success) {
        // Check if user is admin
        if (result.user.roles && result.user.roles.some(role => role.name === 'ADMIN')) {
          navigate('/admin');
        } else {
          navigate(from);
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Có lỗi xảy ra khi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>CLB Gà Chọi Anh Cương</h1>
          <h2>Đăng nhập</h2>
          <p>Đăng nhập để truy cập trang quản trị</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Nhập tên đăng nhập"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Nhập mật khẩu"
            />
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="login-footer">
          <a href="/" className="back-home">
            ← Quay về trang chủ
          </a>
        </div>

        <div className="login-info">
          <h3>Thông tin liên hệ</h3>
          <p>📞 Hotline: <a href="tel:0387683857">0387683857</a></p>
          <p>📍 Địa chỉ: Phước Lâm, Hoà Hiệp Bắc, Đông Hoà, Phú Yên</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
