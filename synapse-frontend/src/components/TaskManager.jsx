import { useState, useEffect } from 'react'
import '../styles/taskManager.css'

const TaskManager = ({ socket, roomId, username, pdfTasks = [] }) => {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [taskType, setTaskType] = useState('group')
  const [showAddForm, setShowAddForm] = useState(false)

  // AI suggested tasks (same for everyone)
  const aiSuggestedTasks = [
    { id: 'ai-1', text: 'Review project requirements', type: 'ai', completed: false },
    { id: 'ai-2', text: 'Brainstorm creative solutions', type: 'ai', completed: false },
    { id: 'ai-3', text: 'Set up team communication', type: 'ai', completed: false },
    { id: 'ai-4', text: 'Create project timeline', type: 'ai', completed: false }
  ]

  useEffect(() => {
    // Initialize with AI suggested tasks
    setTasks(prev => {
      const existingAiTasks = prev.filter(task => task.type === 'ai')
      if (existingAiTasks.length === 0) {
        return [...prev, ...aiSuggestedTasks]
      }
      return prev
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle PDF tasks integration
  useEffect(() => {
    if (pdfTasks && pdfTasks.length > 0) {
      console.log('[TaskManager] Adding PDF tasks:', pdfTasks);
      setTasks(prev => {
        // Remove any existing PDF tasks and add new ones
        const nonPdfTasks = prev.filter(task => task.type !== 'ai-pdf');
        return [...nonPdfTasks, ...pdfTasks];
      });
    }
  }, [pdfTasks]);

  useEffect(() => {
    if (!socket) return

    // Listen for group tasks updates
    const handleGroupTasksUpdate = (groupTasks) => {
      console.log('[TaskManager] Group tasks updated:', groupTasks)
      setTasks(prev => {
        // Keep personal and AI tasks, replace group tasks
        const personalTasks = prev.filter(task => task.type === 'personal')
        const aiTasks = prev.filter(task => task.type === 'ai')
        return [...personalTasks, ...aiTasks, ...groupTasks]
      })
    }

    // Listen for task toggle updates
    const handleTaskToggled = (updatedTask) => {
      console.log('[TaskManager] Task toggled:', updatedTask)
      setTasks(prev => prev.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ))
    }

    socket.on('group-tasks-updated', handleGroupTasksUpdate)
    socket.on('task-toggled', handleTaskToggled)

    return () => {
      socket.off('group-tasks-updated', handleGroupTasksUpdate)
      socket.off('task-toggled', handleTaskToggled)
    }
  }, [socket])

  const handleAddTask = (e) => {
    e.preventDefault()
    if (!newTask.trim()) return

    const task = {
      id: Date.now() + Math.random(),
      text: newTask.trim(),
      type: taskType,
      completed: false,
      createdBy: username,
      timestamp: new Date().toISOString()
    }

    if (taskType === 'personal') {
      // Add personal task locally only
      setTasks(prev => [...prev, task])
    } else if (taskType === 'group') {
      // Send group task to server to sync with all users
      if (socket && roomId) {
        socket.emit('add-group-task', { roomId, task })
      }
    }

    setNewTask('')
    setShowAddForm(false)
  }

  const handleToggleTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    const updatedTask = { ...task, completed: !task.completed }

    if (task.type === 'personal') {
      // Update personal task locally
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t))
    } else if (task.type === 'group' && socket && roomId) {
      // Send group task toggle to server
      socket.emit('toggle-group-task', { roomId, taskId, completed: updatedTask.completed })
    } else if (task.type === 'ai' || task.type === 'ai-pdf') {
      // Update AI task locally (each user's progress is independent)
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t))
    }
  }

  const getTaskTypeColor = (type) => {
    switch (type) {
      case 'ai': return 'ai-task'
      case 'ai-pdf': return 'ai-pdf-task'
      case 'group': return 'group-task'
      case 'personal': return 'personal-task'
      default: return 'group-task'
    }
  }

  const getTaskTypeLabel = (type) => {
    switch (type) {
      case 'ai': return '🤖 AI Suggested'
      case 'ai-pdf': return '📄 PDF Analysis'
      case 'group': return '👥 Group Task'
      case 'personal': return '👤 Personal'
      default: return '👥 Group Task'
    }
  }

  return (
    <div className="task-manager">
      <div className="task-header">
        <h3>Task Management</h3>
        <button 
          className="add-task-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? '✕' : '+'}
        </button>
      </div>

      {showAddForm && (
        <form className="add-task-form" onSubmit={handleAddTask}>
          <div className="task-input-group">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Enter task description..."
              className="task-input"
              autoFocus
            />
            <select 
              value={taskType} 
              onChange={(e) => setTaskType(e.target.value)}
              className="task-type-select"
            >
              <option value="group">👥 Group Task</option>
              <option value="personal">👤 Personal</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" className="submit-btn">Add Task</button>
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="task-list">
        {tasks.length === 0 ? (
          <div className="empty-tasks">
            No tasks yet. Add a task to get started!
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className={`task-item ${getTaskTypeColor(task.type)} ${task.completed ? 'completed' : ''}`}>
              <div className="task-content">
                <button 
                  className="task-checkbox"
                  onClick={() => handleToggleTask(task.id)}
                >
                  {task.completed ? '✓' : '○'}
                </button>
                <div className="task-details">
                  <div className="task-text">{task.text}</div>
                  <div className="task-meta">
                    <span className="task-type-label">{getTaskTypeLabel(task.type)}</span>
                    {task.createdBy && task.type !== 'ai' && (
                      <span className="task-creator">by {task.createdBy}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default TaskManager
