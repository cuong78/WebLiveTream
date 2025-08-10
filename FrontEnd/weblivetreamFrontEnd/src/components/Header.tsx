import React from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showLiveIndicator?: boolean;
  contactNumber?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  showLiveIndicator = false,
  contactNumber = "0393835679"
}) => {
  const isAuthenticated = authService.isAuthenticated();
  const isAdmin = authService.isAdmin();
  const username = authService.getUsername();

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/';
  };

  return (
    <header className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo và Title */}
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <Link to="/">
                <img 
                  className="h-10 w-10 rounded-full" 
                  src="/logo.png" 
                  alt="Logo"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23ef4444'/%3E%3Ctext x='50%25' y='50%25' font-size='16' fill='white' text-anchor='middle' dy='.3em'%3EL%3C/text%3E%3C/svg%3E";
                  }}
                />
              </Link>
            </div>
            <div>
              <Link to="/" className="text-xl font-bold text-white hover:text-gray-300">
                {title}
              </Link>
              {subtitle && (
                <p className="text-sm text-gray-300">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Live Indicator và Controls */}
          <div className="flex items-center space-x-4">
            {showLiveIndicator && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-500 font-semibold text-sm">TRỰC TIẾP</span>
              </div>
            )}
            
            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-white text-sm">
                  Xin chào, {username}
                </span>
                {isAdmin && (
                  <Link 
                    to="/admin"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link 
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Đăng nhập
              </Link>
            )}
            
            {/* Contact Info */}
            <div className="hidden md:flex items-center space-x-4">
              <a 
                href={`tel:${contactNumber}`}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                📞 {contactNumber}
              </a>
              <a 
                href={`https://zalo.me/${contactNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                💬 Zalo
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Contact Bar */}
      <div className="md:hidden bg-gray-800 px-4 py-2">
        <div className="flex items-center justify-center space-x-4">
          <a 
            href={`tel:${contactNumber}`}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
          >
            📞 Gọi Ngay
          </a>
          <a 
            href={`https://zalo.me/${contactNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
          >
            💬 Zalo
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
              <a 
                href={`tel:${contactNumber}`}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                📞 {contactNumber}
              </a>
              <a 
                href={`https://zalo.me/${contactNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                💬 Zalo
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Contact Bar */}
      <div className="md:hidden bg-gray-800 px-4 py-2">
        <div className="flex items-center justify-center space-x-4">
          <a 
            href={`tel:${contactNumber}`}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
          >
            📞 Gọi Ngay
          </a>
          <a 
            href={`https://zalo.me/${contactNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
          >
            💬 Zalo
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
