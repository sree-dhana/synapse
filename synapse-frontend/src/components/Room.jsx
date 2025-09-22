"use client"

import { useEffect, useState, useCallback } from "react"
import { createRoom, joinRoom } from "../api"
import { io } from "socket.io-client"
import ChatSectionSimple from "./ChatSectionSimple"
import GeminiPdfAnalyzer from "../components/GeminiPdfAnalyzer"
import FloatingMenu from "../components/FloatingMenu"
import TaskManager from "../components/TaskManager"
import "../styles/room.css"

const socketURL = "http://localhost:5000"

const Room = () => {
  const [socket, setSocket] = useState(null)
  const [roomId, setRoomId] = useState(() => localStorage.getItem('activeRoomId') || "")
  const [joiningCode, setJoiningCode] = useState("")
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)
  const [username] = useState(() => localStorage.getItem('username') || "Anonymous")
  const [pdfTasks, setPdfTasks] = useState([]);

  useEffect(() => {
    const s = io(socketURL, { withCredentials: true })
    setSocket(s)
    return () => { s.disconnect() }
  }, [])

  useEffect(() => {
    if (socket && roomId) {
      console.log('[Room] Auto joining existing room', roomId, 'as', username)
      socket.emit('join-room', { roomId, username })
    }
  }, [socket, roomId, username])

  const attachSocketJoin = useCallback((rid) => {
    if (!socket) return
    socket.emit('join-room', { roomId: rid, username })
  }, [socket, username])

  // Handle PDF tasks generation callback
  const handlePdfTasksGenerated = useCallback((tasks, fileName) => {
    console.log('[Room] PDF tasks generated:', tasks, 'from file:', fileName);
    setPdfTasks(tasks);
    setStatus(`✅ Added ${tasks.length} tasks from ${fileName} to Task Manager`);
  }, []);

  const handleCreate = async () => {
    setLoading(true); setStatus("")
    try {
      const { data } = await createRoom()
      setRoomId(data.roomId)
      localStorage.setItem('activeRoomId', data.roomId)
      setStatus(`Created room ${data.roomId}`)
      attachSocketJoin(data.roomId)
    } catch (e) {
      setStatus(e.response?.data?.message || 'Create failed')
    } finally { setLoading(false) }
  }

  const handleJoin = async (e) => {
    e.preventDefault(); setLoading(true); setStatus("")
    try {
      const code = joiningCode.trim()
      const { data } = await joinRoom(code)
      setRoomId(code)
      localStorage.setItem('activeRoomId', code)
      setStatus(data.message)
      attachSocketJoin(code)
    } catch (e) {
      setStatus(e.response?.data?.message || 'Join failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="room-container">
      <div className="room-top-bar">
        <div className="actions">
          <button onClick={handleCreate} disabled={loading} className="top-btn">
            {loading ? '...' : 'Create Room'}
          </button>
          <form onSubmit={handleJoin} className="join-form">
            <input
              value={joiningCode}
              onChange={(e) => setJoiningCode(e.target.value)}
              placeholder="Enter code"
              maxLength={6}
            />
            <button disabled={loading || !joiningCode} className="top-btn" type="submit">
              Join
            </button>
          </form>
          {roomId && <span className="room-label">Active Room: {roomId}</span>}
        </div>
        {status && <div className="status-text">{status}</div>}
      </div>

      <div className="room-layout">
        <div className="chat-section">
          <ChatSectionSimple socket={socket} roomId={roomId} username={username} />
        </div>
        <div className="right-section">
          <div className="pdf-section">
            <GeminiPdfAnalyzer onTasksGenerated={handlePdfTasksGenerated} roomId={roomId} socket={socket} />
          </div>
          <div className="task-section">
            <TaskManager 
              socket={socket} 
              roomId={roomId} 
              username={username} 
              pdfTasks={pdfTasks}
            />
          </div>
        </div>
      </div>

      <FloatingMenu />
    </div>
  )
}

export default Room
