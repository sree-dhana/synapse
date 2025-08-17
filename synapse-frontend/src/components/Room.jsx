"use client"

import { useEffect, useState, useCallback } from "react"
import { createRoom, joinRoom } from "../api"
import { io } from "socket.io-client"
import ChatSection from "../components/ChatSection"
import PdfAnalyzer from "../components/PdfAnalyzer"
import FloatingMenu from "../components/FloatingMenu"
import "../styles/room.css"

const socketURL = "http://localhost:5000"

const Room = () => {
  const [socket, setSocket] = useState(null)
  const [roomId, setRoomId] = useState(() => localStorage.getItem('activeRoomId') || "")
  const [joiningCode, setJoiningCode] = useState("")
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const s = io(socketURL, { withCredentials: true })
    setSocket(s)
    return () => { s.disconnect() }
  }, [])

  // Auto re-join if we already have a roomId (e.g. after navigation from dashboard)
  useEffect(()=>{
    if(socket && roomId){
      console.log('[Room] Auto joining existing room', roomId)
      socket.emit('join-room', roomId)
    }
  }, [socket, roomId])


  const attachSocketJoin = useCallback((rid) => {
    if (!socket) return
    socket.emit('join-room', rid)
  }, [socket])

  const handleCreate = async () => {
    console.log('[Room] Create button clicked')
    setLoading(true); setStatus("")
    try {
      console.log('[Room] Sending createRoom request')
      const { data } = await createRoom()
      console.log('[Room] createRoom response', data)
      setRoomId(data.roomId)
  localStorage.setItem('activeRoomId', data.roomId)
      setStatus(`Created room ${data.roomId}`)
      attachSocketJoin(data.roomId)
    } catch (e) {
      console.error('[Room] createRoom error', e)
      setStatus(e.response?.data?.message || 'Create failed')
    } finally { setLoading(false) }
  }

  const handleJoin = async (e) => {
    e.preventDefault(); setLoading(true); setStatus("")
    try {
  const code = joiningCode.trim()
  console.log('[Room] Attempting joinRoom', code)
  const { data } = await joinRoom(code)
  console.log('[Room] joinRoom response', data)
      setRoomId(joiningCode.trim())
  localStorage.setItem('activeRoomId', joiningCode.trim())
      setStatus(data.message)
      attachSocketJoin(joiningCode.trim())
    } catch (e) {
  console.error('[Room] joinRoom error', e)
      setStatus(e.response?.data?.message || 'Join failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="room-container">
      <div className="room-top-bar">
        <div className="actions">
          <button onClick={handleCreate} disabled={loading} className="top-btn">{loading? '...' : 'Create Room'}</button>
          <form onSubmit={handleJoin} className="join-form">
            <input value={joiningCode} onChange={(e)=>setJoiningCode(e.target.value)} placeholder="Enter code" maxLength={6} />
            <button disabled={loading || !joiningCode} className="top-btn" type="submit">Join</button>
          </form>
          {roomId && <span className="room-label">Active Room: {roomId}</span>}
        </div>
        {status && <div className="status-text">{status}</div>}
      </div>
      <div className="room-layout">
        <div className="chat-section">
          <ChatSection socket={socket} roomId={roomId} />
        </div>
        <div className="pdf-section">
          <PdfAnalyzer />
        </div>
      </div>
      <FloatingMenu />
    </div>
  )
}

export default Room
