"use client"

import { useState } from "react"

const FloatingMenu = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="floating-menu">
      <div className={`menu-options ${isOpen ? "open" : ""}`}>
        <button className="menu-option leaderboard-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.5 21H2V9h5.5v12zm7.25-18h-5.5v18h5.5V3zM22 11h-5.5v10H22V11z" />
          </svg>
          <span>Leaderboard</span>
        </button>
        <button className="menu-option quiz-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2C13.1,2 14,2.9 14,4C14,5.1 13.1,6 12,6C10.9,6 10,5.1 10,4C10,2.9 10.9,2 12,2M21,9V7L15,1H5C3.89,1 3,1.89 3,3V21A2,2 0 0,0 5,23H19A2,2 0 0,0 21,21V9M19,9H14V4H5V21H19V9Z" />
          </svg>
          <span>Quiz</span>
        </button>
      </div>

      <button className={`fab-button ${isOpen ? "open" : ""}`} onClick={toggleMenu}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="fab-icon">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
      </button>
    </div>
  )
}

export default FloatingMenu
