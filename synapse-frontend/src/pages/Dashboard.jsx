import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createRoom, joinRoom } from "../api"
import "../styles/dashboard.css"

const Dashboard = () => {
  const [roomCode,setRoomCode] = useState("")
  const [status,setStatus] = useState("")
  const [loading,setLoading] = useState(false)
  const navigate = useNavigate()

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
      setStatus(e.response?.data?.message || 'Create failed')
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
      setStatus(e.response?.data?.message || 'Join failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="profile-section">
          <div className="profile-avatar">
            <img src="/user-profile-avatar.png" alt="User Profile" className="avatar-image" />
          </div>
          <h1 className="user-name">Welcome</h1>
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
  )
}

export default Dashboard
