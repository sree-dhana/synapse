import React, { useState } from 'react';
import { taskIntegrationService } from '../services/taskIntegrationService';

/**
 * Summary Display Component
 * Shows collapsible PDF summary with key information
 */
export const SummaryDisplay = ({ summary }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!summary) {
    return (
      <div className="summary-section">
        <div className="section-header">
          <h3>📄 Document Summary</h3>
        </div>
        <div className="summary-content">
          <p className="no-content">No summary available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="summary-section enhanced">
      <div 
        className="section-header clickable"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="header-content">
          <h3>📄 Document Summary</h3>
          <div className="header-badge">
            <span className="document-type">PDF Analysis</span>
          </div>
        </div>
        <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
          ▼
        </span>
      </div>

      {isExpanded && (
        <div className="summary-content enhanced">
          {/* Main Overview Card */}
          <div className="summary-card primary">
            <div className="card-header">
              <h4>📋 Overview</h4>
            </div>
            <div className="card-content">
              <p className="overview-text">{summary.overview || summary.summary || summary.description}</p>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="metrics-grid">
            <div className="metric-card difficulty">
              <div className="metric-icon">📊</div>
              <div className="metric-content">
                <div className="metric-label">Difficulty Level</div>
                <div className={`metric-value difficulty-${summary.difficulty || 'medium'}`}>
                  {(summary.difficulty || 'medium').toUpperCase()}
                </div>
              </div>
            </div>

            <div className="metric-card reading-time">
              <div className="metric-icon">⏱️</div>
              <div className="metric-content">
                <div className="metric-label">Reading Time</div>
                <div className="metric-value">
                  {summary.estimatedReadingTime || summary.readingTime || '10-15 min'}
                </div>
              </div>
            </div>

            <div className="metric-card confidence">
              <div className="metric-icon">🎯</div>
              <div className="metric-content">
                <div className="metric-label">AI Confidence</div>
                <div className="metric-value">
                  {Math.round((summary.confidence || 0.85) * 100)}%
                </div>
              </div>
            </div>
          </div>

          {/* Key Topics Section */}
          {(summary.keyTopics || summary.topics) && (summary.keyTopics || summary.topics).length > 0 && (
            <div className="summary-card topics">
              <div className="card-header">
                <h4>🔑 Key Topics</h4>
                <span className="topic-count">
                  {(summary.keyTopics || summary.topics).length} topics
                </span>
              </div>
              <div className="card-content">
                <div className="topics-grid">
                  {(summary.keyTopics || summary.topics).map((topic, index) => (
                    <div key={index} className="topic-chip">
                      <span className="topic-text">{topic}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Learning Objectives if available */}
          {summary.learningObjectives && summary.learningObjectives.length > 0 && (
            <div className="summary-card objectives">
              <div className="card-header">
                <h4>🎯 Learning Objectives</h4>
              </div>
              <div className="card-content">
                <ul className="objectives-list">
                  {summary.learningObjectives.map((objective, index) => (
                    <li key={index} className="objective-item">
                      <span className="objective-bullet">•</span>
                      <span className="objective-text">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Roadmap Display Component
 * Shows learning roadmap as a timeline with milestones
 */
export const RoadmapDisplay = ({ roadmap }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  if (!roadmap) {
    return (
      <div className="roadmap-section">
        <div className="section-header">
          <h3>🗺️ Learning Roadmap</h3>
        </div>
        <div className="roadmap-content">
          <p className="no-content">No roadmap available</p>
        </div>
      </div>
    );
  }

  const totalHours = roadmap.milestones?.reduce((sum, milestone) => 
    sum + (milestone.estimated_hours || milestone.estimatedHours || 0), 0) || 0;

  return (
    <div className="roadmap-section enhanced">
      <div 
        className="section-header clickable"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="header-content">
          <h3>🗺️ Learning Roadmap</h3>
          <div className="header-stats">
            <span className="milestone-count">
              {(roadmap.milestones || roadmap).length || 0} milestones
            </span>
            <span className="time-estimate">
              {totalHours}h total
            </span>
          </div>
        </div>
        <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
          ▼
        </span>
      </div>

      {isExpanded && (
        <div className="roadmap-content enhanced">
          {/* Roadmap Overview */}
          <div className="roadmap-overview-card">
            <div className="overview-header">
              <h4>{roadmap.title || 'Learning Path'}</h4>
              <div className="progress-indicator">
                <span className="progress-text">Ready to start</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>
            <p className="overview-description">
              {roadmap.description || 'A structured learning path based on the document analysis.'}
            </p>
          </div>

          {/* Timeline Visualization */}
          <div className="timeline-container">
            <div className="timeline-header">
              <h4>📍 Learning Timeline</h4>
            </div>
            
            <div className="timeline-track">
              {(roadmap.milestones || roadmap || []).map((milestone, index) => (
                <EnhancedMilestoneCard 
                  key={milestone.milestone_id || milestone.id || index}
                  milestone={milestone} 
                  index={index}
                  isLast={index === ((roadmap.milestones || roadmap).length - 1)}
                  isSelected={selectedMilestone === index}
                  onSelect={() => setSelectedMilestone(selectedMilestone === index ? null : index)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Enhanced Milestone Card Component
 */
const EnhancedMilestoneCard = ({ milestone, index, isLast, isSelected, onSelect }) => {
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '🔥';
      case 'medium': return '⚡';
      case 'low': return '💡';
      default: return '📌';
    }
  };

  return (
    <div className={`milestone-item ${isSelected ? 'selected' : ''}`}>
      {/* Timeline connector */}
      <div className="timeline-connector">
        <div className="milestone-number">{index + 1}</div>
        {!isLast && <div className="connector-line"></div>}
      </div>

      {/* Milestone content */}
      <div className="milestone-content" onClick={onSelect}>
        <div className="milestone-header">
          <div className="milestone-title-row">
            <h5 className="milestone-title">
              {milestone.title || `Milestone ${index + 1}`}
            </h5>
            <div className="milestone-badges">
              <span 
                className="priority-badge"
                style={{ backgroundColor: getPriorityColor(milestone.priority) }}
              >
                {getPriorityIcon(milestone.priority)} {milestone.priority || 'medium'}
              </span>
              <span className="time-badge">
                ⏱️ {milestone.estimated_hours || milestone.estimatedHours || 2}h
              </span>
            </div>
          </div>
        </div>

        <p className="milestone-description">
          {milestone.description || 'No description available'}
        </p>

        {/* Milestone tasks preview */}
        {milestone.tasks && milestone.tasks.length > 0 && (
          <div className="milestone-tasks-preview">
            <div className="tasks-summary">
              <span className="tasks-count">
                📝 {milestone.tasks.length} tasks
              </span>
              <span className="task-points">
                🏆 {milestone.tasks.reduce((sum, task) => sum + (task.points || 10), 0)} points
              </span>
            </div>
            
            {isSelected && (
              <div className="tasks-expanded">
                {milestone.tasks.map((task, taskIndex) => (
                  <div key={taskIndex} className="task-preview">
                    <span className="task-bullet">•</span>
                    <span className="task-text">{task.title || task.text}</span>
                    <span className="task-time">({task.estimated_hours || 1}h)</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Expand indicator */}
        <div className="expand-indicator">
          {milestone.tasks && milestone.tasks.length > 0 && (
            <span className="expand-hint">
              {isSelected ? 'Click to collapse' : 'Click to see tasks'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Tasks Display Component
 * Shows recommended tasks as interactive checkboxes
 */
export const TasksDisplay = ({ tasks, onSendToTaskManager }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [taskStates, setTaskStates] = useState({});
  const [filter, setFilter] = useState('all'); // all, completed, pending
  const [sortBy, setSortBy] = useState('order'); // order, difficulty, points

  // Handle task completion toggle
  const toggleTaskCompletion = (taskId) => {
    setTaskStates(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // Send tasks to task manager
  const handleSendToTaskManager = () => {
    if (onSendToTaskManager && tasks) {
      const tasksForManager = tasks.map(task => ({
        id: `pdf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: task.title || task.text || task.description,
        type: 'ai-pdf',
        completed: false,
        createdBy: 'AI Assistant',
        difficulty: task.difficulty || 'medium',
        points: task.points || 10,
        estimatedHours: task.estimatedHours || task.estimated_hours || 1,
        category: task.category || 'analysis',
        priority: task.priority || 'medium',
        source: 'pdf-analysis'
      }));
      
      onSendToTaskManager(tasksForManager);
    }
  };

  // Filter and sort tasks
  const getFilteredAndSortedTasks = () => {
    let filteredTasks = tasks || [];

    // Apply filter
    if (filter === 'completed') {
      filteredTasks = filteredTasks.filter(task => taskStates[task.id]);
    } else if (filter === 'pending') {
      filteredTasks = filteredTasks.filter(task => !taskStates[task.id]);
    }

    // Apply sorting
    filteredTasks.sort((a, b) => {
      switch (sortBy) {
        case 'difficulty': {
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        }
        case 'points':
          return b.points - a.points;
        case 'order':
        default:
          return a.order - b.order;
      }
    });

    return filteredTasks;
  };

  const filteredTasks = getFilteredAndSortedTasks();
  const completedCount = tasks?.filter(task => taskStates[task.id]).length || 0;
  const totalPoints = tasks?.reduce((sum, task) => 
    taskStates[task.id] ? sum + task.points : sum, 0) || 0;

  return (
    <div className="tasks-section">
      <div 
        className="section-header clickable"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3>✅ Recommended Tasks</h3>
        <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
          ▼
        </span>
      </div>

      {isExpanded && (
        <div className="tasks-content">
          {/* Task Statistics */}
          <div className="task-stats">
            <div className="stat-card">
              <div className="stat-number">{completedCount}/{tasks?.length || 0}</div>
              <div className="stat-label">Tasks Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{totalPoints}</div>
              <div className="stat-label">Points Earned</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {Math.round((completedCount / (tasks?.length || 1)) * 100)}%
              </div>
              <div className="stat-label">Progress</div>
            </div>
          </div>

          {/* Task Controls */}
          <div className="task-controls">
            <div className="control-group">
              <div className="filter-controls">
                <label>Filter:</label>
                <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                  <option value="all">All Tasks</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="sort-controls">
                <label>Sort by:</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="order">Order</option>
                  <option value="difficulty">Difficulty</option>
                  <option value="points">Points</option>
                </select>
              </div>
            </div>

            {onSendToTaskManager && tasks && tasks.length > 0 && (
              <div className="task-actions">
                <button 
                  className="send-to-manager-btn"
                  onClick={handleSendToTaskManager}
                  title="Add these tasks to your Task Manager"
                >
                  📋 Add to Task Manager
                </button>
              </div>
            )}
          </div>

          {/* Tasks List */}
          <div className="tasks-list">
            {filteredTasks.map((task) => (
              <TaskCard 
                key={task.id}
                task={task}
                isCompleted={!!taskStates[task.id]}
                onToggle={() => toggleTaskCompletion(task.id)}
              />
            ))}

            {filteredTasks.length === 0 && (
              <div className="no-tasks">
                <p>No tasks match the current filter.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Individual Task Card Component
 */
const TaskCard = ({ task, isCompleted, onToggle }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return '#28a745';
      case 'medium': return '#ffc107';
      case 'hard': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'reading': return '📖';
      case 'practice': return '💪';
      case 'research': return '🔍';
      case 'review': return '🔄';
      default: return '📝';
    }
  };

  return (
    <div className={`task-card ${isCompleted ? 'completed' : ''}`}>
      <div className="task-checkbox-container">
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={onToggle}
          className="task-checkbox"
        />
      </div>

      <div className="task-content">
        <div className="task-header">
          <h4 className={isCompleted ? 'completed-title' : ''}>{task.title}</h4>
          <div className="task-badges">
            <span className="category-badge">
              {getCategoryIcon(task.category)} {task.category}
            </span>
            <span 
              className="difficulty-badge"
              style={{ backgroundColor: getDifficultyColor(task.difficulty) }}
            >
              {task.difficulty}
            </span>
          </div>
        </div>

        <p className="task-description">{task.description}</p>

        <div className="task-meta">
          <span className="task-time">⏱️ {task.estimatedTime}</span>
          <span className="task-points">🏆 {task.points} points</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Additional Resources Display Component
 */
export const ResourcesDisplay = ({ resources }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getResourceIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'article': return '📄';
      case 'video': return '🎥';
      case 'book': return '📚';
      case 'course': return '🎓';
      default: return '🔗';
    }
  };

  return (
    <div className="resources-section">
      <div 
        className="section-header clickable"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3>📚 Additional Resources</h3>
        <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
          ▼
        </span>
      </div>

      {isExpanded && (
        <div className="resources-content">
          <div className="resources-list">
            {resources.map((resource, index) => (
              <div key={index} className="resource-card">
                <div className="resource-icon">
                  {getResourceIcon(resource.type)}
                </div>
                <div className="resource-content">
                  <h4>{resource.title}</h4>
                  <p>{resource.description}</p>
                  <span className="resource-type">{resource.type}</span>
                  {resource.url && (
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="resource-link"
                    >
                      Visit Resource →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};