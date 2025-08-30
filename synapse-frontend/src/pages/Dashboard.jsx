import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { createRoom, joinRoom } from "../api"
import { isAuthenticated, getAuthUser } from "../utils/auth"
import "../styles/dashboard.css"

const Dashboard = ({ onLogout }) => {
  const [roomCode,setRoomCode] = useState("")
  const [status,setStatus] = useState("")
  const [loading,setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  // Check authentication when component mounts
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }
    
    const authUser = getAuthUser()
    setUser(authUser)
  }, [navigate])

  const handleLogout = () => {
    if (onLogout) onLogout()
    navigate('/login')
  }

  const goToRoom = (rid) => {
    // store active room id so Room component can pick it up (or pass via query)
    localStorage.setItem('activeRoomId', rid)
    navigate('/rooms')
  }

  const handleCreate = async () => {
    setLoading(true); setStatus('')
    try {
      const { data } = await createRoom()
      setStatus(`Created room ${data.roomId}`)
      goToRoom(data.roomId)
    } catch(e){
      console.error('Create room error:', e)
      if (e.response?.status === 401) {
        setStatus('Authentication failed. You are not authorized to create rooms.')
        setTimeout(() => {
          handleLogout()
        }, 2000)
      } else if (e.response?.status === 403) {
        setStatus('Access denied. Please contact administrator.')
      } else {
        setStatus(e.response?.data?.message || 'Create failed. Please try again.')
      }
    } finally { setLoading(false) }
  }

  const handleJoin = async () => {
    if(!roomCode.trim()) return
    setLoading(true); setStatus('')
    try {
      const { data } = await joinRoom(roomCode.trim())
      setStatus(data.message)
      goToRoom(roomCode.trim())
    } catch(e){
      console.error('Join room error:', e)
      if (e.response?.status === 401) {
        setStatus('Authentication failed. You are not authorized to join rooms.')
        setTimeout(() => {
          handleLogout()
        }, 2000)
      } else if (e.response?.status === 403) {
        setStatus('Access denied. Please contact administrator.')
      } else {
        setStatus(e.response?.data?.message || 'Join failed. Please try again.')
      }
    } finally { setLoading(false) }
  }

  // Show loading if user data is not loaded yet
  if (!user) {
    return <div className="dashboard-container"><div>Loading...</div></div>
  }

  // Generate consistent color for user avatar
  const colors = [
    'linear-gradient(135deg, #3b82f6, #1d4ed8)', // Blue
    'linear-gradient(135deg, #10b981, #059669)', // Green
    'linear-gradient(135deg, #f59e0b, #d97706)', // Orange
    'linear-gradient(135deg, #ef4444, #dc2626)', // Red
    'linear-gradient(135deg, #8b5cf6, #7c3aed)', // Purple
    'linear-gradient(135deg, #06b6d4, #0891b2)', // Cyan
    'linear-gradient(135deg, #84cc16, #65a30d)', // Lime
    'linear-gradient(135deg, #f97316, #ea580c)'  // Orange-red
  ];
  const colorIndex = user.username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <h2 className="app-title">Clique</h2>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 012 2v2h-2V4H4v16h10v-2h2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2h10z"/>
            </svg>
            Logout
          </button>
        </div>
      </header>
      
      <div className="dashboard-content">
        <div className="dashboard-card">
          <div className="profile-section">
            <div className="profile-avatar">
              <div 
                className="user-avatar-circle"
                style={{ background: colors[colorIndex] }}
              >
                {user.username.charAt(0).toUpperCase()}
              </div>
            </div>
            <h1 className="user-name">Welcome, {user.username}</h1>
          </div>
        
          <div className="action-buttons">
            <button onClick={handleCreate} className="btn-primary" disabled={loading}>{loading? '...' : 'Create Room'}</button>
            <button onClick={()=>document.querySelector('.room-code-input')?.focus()} className="btn-secondary" disabled={loading}>Join Room</button>
          </div>
          <div className="room-code-section">
            <div className="room-code-input-group">
              <input value={roomCode} onChange={(e)=>setRoomCode(e.target.value)} type="text" placeholder="Enter Room Code" className="room-code-input" maxLength={6} />
              <button onClick={handleJoin} className="btn-join" disabled={loading || !roomCode.trim()}>Join</button>
            </div>
            {status && <div className="status-text" style={{marginTop:'12px', fontSize:'0.85rem'}}>{status}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
