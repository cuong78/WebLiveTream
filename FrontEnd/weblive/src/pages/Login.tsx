import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Login failed')
      const token = data?.data?.token
      const refresh = data?.data?.refreshToken
      if (!token) throw new Error('Invalid response')
      localStorage.setItem('token', token)
      if (refresh) localStorage.setItem('refreshToken', refresh)
      navigate('/admin')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="container" style={{paddingTop:24}}>
      <h2 className="title" style={{textAlign:'center'}}>Đăng nhập Admin</h2>
      <form onSubmit={handleSubmit} className="card" style={{marginTop:12}}>
        <input className="input" placeholder="Tên đăng nhập" value={username} onChange={e=>setUsername(e.target.value)} />
        <input className="input" placeholder="Mật khẩu" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <div style={{color:'#ff6b6b', marginTop:8}}>{error}</div>}
        <button className="btn btn-primary" type="submit" style={{marginTop:8}}>Đăng nhập</button>
      </form>
    </div>
  )
}


