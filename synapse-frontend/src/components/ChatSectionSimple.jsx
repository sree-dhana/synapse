import { useEffect, useState, useRef } from "react"

const ChatSectionSimple = ({ socket, roomId, username }) => {
  const [message, setMessage] = useState("")
  const [copied, setCopied] = useState(false)
  const [messages, setMessages] = useState([])
  const [participants, setParticipants] = useState([])
  const endRef = useRef(null)

  // Listen for participants updates
  useEffect(() => {
    if (!socket || !roomId) return
    
    const handleParticipants = (participantsList) => {
      console.log('[ChatSection] participants update:', participantsList)
      setParticipants(participantsList)
    }
    
    socket.on('participants', handleParticipants)
    return () => socket.off('participants', handleParticipants)
  }, [socket, roomId])

  // Listen for messages
  useEffect(() => {
    if (!socket) return
    
    const handleNewMessage = (messageData) => {
      console.log('[ChatSection] new message:', messageData)
      
      // Mark if message is from current user
      const messageWithUserFlag = {
        ...messageData,
        isUser: messageData.sender === username
      }
      
      setMessages(prev => [...prev, messageWithUserFlag])
    }
    
    socket.on('new-message', handleNewMessage)
    return () => socket.off('new-message', handleNewMessage)
  }, [socket, username])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const copyRoomCode = async () => {
    try {
      if (roomId) await navigator.clipboard.writeText(roomId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy room code:", err)
    }
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (message.trim() && socket && roomId) {
      socket.emit('chat-message', { roomId, message: message.trim() })
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
          {participants.length === 0 && (
            <div className="empty-participants">
              No participants yet. Share the room code to invite others.
            </div>
          )}
          {participants.map((participant, index) => {
            // Generate a consistent color based on username
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
            const colorIndex = participant.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
            
            return (
              <div key={index} className="participant-item">
                <div className="participant-avatar">
                  <div 
                    className="avatar-circle"
                    style={{ background: colors[colorIndex] }}
                  >
                    {participant.charAt(0).toUpperCase()}
                  </div>
                  <div className="status-indicator online"></div>
                </div>
                <div className="participant-info">
                  <span className="participant-name">{participant}</span>
                  <span className="participant-status">online</span>
                </div>
              </div>
            )
          })}
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

export default ChatSectionSimple
