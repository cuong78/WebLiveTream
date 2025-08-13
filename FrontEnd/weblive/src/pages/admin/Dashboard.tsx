import { Link, Routes, Route, useNavigate } from 'react-router-dom'
import GoLive from './GoLive.tsx'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    navigate('/login')
  }

  return (
    <div>
      <header className="navbar">
        <div className="navbar-inner container" style={{justifyContent:'space-between'}}>
          <div className="brand"><img src="/vite.svg" alt="" /> <span>Admin</span></div>
          <nav style={{display:'flex', gap:12}}>
            <Link to="">Tổng quan</Link>
            <Link to="live">Go Live</Link>
            <button className="btn btn-danger" onClick={logout}>Đăng xuất</button>
          </nav>
        </div>
      </header>

      <main className="container">
        <Routes>
          <Route path="" element={<Overview />} />
          <Route path="live" element={<GoLive />} />
        </Routes>
      </main>
    </div>
  )
}

function Overview() {
  return (
    <div className="card">
      <div className="title">Bảng điều khiển</div>
      <div className="info-item">- Trạng thái live: Offline</div>
      <div className="info-item">- Người xem hiện tại: 0</div>
    </div>
  )
}


