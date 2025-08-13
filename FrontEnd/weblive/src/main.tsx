import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { ReactElement } from 'react'
import './index.css'
import App from './App.tsx'
import Login from './pages/Login.tsx'
import AdminDashboard from './pages/admin/Dashboard.tsx'

function RequireAuth({ children }: { children: ReactElement }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin/*"
          element={
            <RequireAuth>
              <AdminDashboard />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
