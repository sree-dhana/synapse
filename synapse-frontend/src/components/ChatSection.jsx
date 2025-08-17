"use client"

import { useEffect, useState, useRef } from "react"

const ChatSection = ({ socket, roomId }) => {
  const [message, setMessage] = useState("")
  const [copied, setCopied] = useState(false)
  const [messages, setMessages] = useState([])
  const [participants, setParticipants] = useState([])
  const endRef = useRef(null)

  useEffect(()=>{
    if(!socket) return
    const handleIncoming = (msg) => {
      setMessages(prev => [...prev, { id: prev.length+1, sender: 'Peer', content: msg, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}), isUser:false }])
    }
    socket.on('message', handleIncoming)
    return () => { socket.off('message', handleIncoming) }
  }, [socket])

 
  useEffect(()=>{
    if(!socket || !roomId) return
    const handleParticipants = (list) => {
      setParticipants(list.map(id => ({ id, name: id.slice(0,8), status: 'online' })))
    }
    socket.on('room-participants', handleParticipants)
    return () => { socket.off('room-participants', handleParticipants) }
  }, [socket, roomId])

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:'smooth'}) }, [messages])

  const copyRoomCode = async () => {
    try {
      if(roomId) await navigator.clipboard.writeText(roomId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy room code:", err)
    }
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (message.trim()) {
      const content = message
      setMessages(prev => [...prev, { id: prev.length+1, sender:'You', content, timestamp: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit'}), isUser:true }])
      if(socket && roomId){
        socket.emit('chat-message', { roomId, message: content })
      }
      setMessage("")
    }
  }

  return (
    <div className="chat-container">
      <div className="participants-sidebar">
        <div className="room-id-section">
          <span className="room-id-label">Room ID:</span>
          <div className="room-id-container">
            <span className="room-id-code">{roomId || '------'}</span>
            <button
              className={`room-id-copy-btn ${copied ? "copied" : ""}`}
              onClick={copyRoomCode}
              title="Copy room code"
            >
              {copied ? "✓" : "📋"}
            </button>
          </div>
        </div>

        <h3 className="participants-title">Participants</h3>
        <div className="participants-list">
          {participants.length === 0 && <div className="empty-participants">No participants listed</div>}
          {participants.map((participant) => (
            <div key={participant.id} className="participant-item">
              <div className="participant-avatar">
                <img src={participant.avatar || "/placeholder.svg"} alt={participant.name} />
                <div className={`status-indicator ${participant.status}`}></div>
              </div>
              <div className="participant-info">
                <span className="participant-name">{participant.name}</span>
                <span className="participant-status">{participant.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        <div className="chat-header">
          <h2>Room Chat</h2>
        </div>

        <div className="messages-container">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.isUser ? "user-message" : "bot-message"}`}>
              <div className="message-content">
                <div className="message-header">
                  <span className="sender-name">{msg.sender}</span>
                  <span className="message-time">{msg.timestamp}</span>
                </div>
                <p className="message-text">{msg.content}</p>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <form className="message-input-form" onSubmit={handleSendMessage}>
          <div className="input-container">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="message-input"
            />
            <div className="input-actions">
              <button type="button" className="action-btn video-btn" title="Start Video Call">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                </svg>
              </button>
              <button type="button" className="action-btn voice-btn" title="Record Voice Message">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                </svg>
              </button>
              <button type="submit" className="send-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChatSection
