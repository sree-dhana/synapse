"use client"

import { useState } from "react"

const PdfAnalyzer = () => {
  const [uploadedFile, setUploadedFile] = useState(null)
  const [tasks, setTasks] = useState([
    { id: 1, text: "Read Chapter 1: Introduction to React", completed: false },
    { id: 2, text: "Complete practice exercises", completed: true },
    { id: 3, text: "Review component lifecycle", completed: false },
    { id: 4, text: "Build a simple todo app", completed: false },
  ])

  const roadmapSteps = [
    { id: 1, title: "Foundation", description: "Learn React basics and JSX syntax", status: "completed" },
    { id: 2, title: "Components", description: "Master functional and class components", status: "current" },
    { id: 3, title: "State Management", description: "Understand useState and useEffect hooks", status: "upcoming" },
    { id: 4, title: "Advanced Patterns", description: "Context API and custom hooks", status: "upcoming" },
  ]

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file && file.type === "application/pdf") {
      setUploadedFile(file)
    }
  }

  const toggleTask = (taskId) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)))
  }

  return (
    <div className="pdf-analyzer-container">
      {/* Upload Section */}
      <div className="upload-section">
        <div className="upload-card">
          <h2 className="section-title">AI PDF Analyzer</h2>
          <div className="upload-area">
            <input type="file" accept=".pdf" onChange={handleFileUpload} className="file-input" id="pdf-upload" />
            <label htmlFor="pdf-upload" className="upload-label">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="upload-icon">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
              <span className="upload-text">{uploadedFile ? uploadedFile.name : "Click to upload PDF"}</span>
              <span className="upload-subtext">
                {uploadedFile ? "File ready for analysis" : "Drag and drop or click to browse"}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Roadmap Section */}
      <div className="roadmap-section">
        <h3 className="section-title">Learning Roadmap</h3>
        <div className="roadmap-container">
          {roadmapSteps.map((step, index) => (
            <div key={step.id} className={`roadmap-step ${step.status}`}>
              <div className="step-indicator">
                <span className="step-number">{index + 1}</span>
              </div>
              <div className="step-content">
                <h4 className="step-title">{step.title}</h4>
                <p className="step-description">{step.description}</p>
              </div>
              <div className={`step-status ${step.status}`}>
                {step.status === "completed" && "✓"}
                {step.status === "current" && "→"}
                {step.status === "upcoming" && "○"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks Section */}
      <div className="tasks-section">
        <h3 className="section-title">AI Suggested Tasks</h3>
        <div className="tasks-container">
          {tasks.map((task) => (
            <div key={task.id} className={`task-item ${task.completed ? "completed" : ""}`}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                className="task-checkbox"
                id={`task-${task.id}`}
              />
              <label htmlFor={`task-${task.id}`} className="task-label">
                {task.text}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PdfAnalyzer
