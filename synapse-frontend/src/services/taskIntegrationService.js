// Task integration service for managing PDF-generated tasks with TaskManager
import { v4 as uuidv4 } from 'uuid';

class TaskIntegrationService {
  constructor() {
    this.pdfTasks = [];
    this.listeners = [];
  }

  // Add tasks from PDF analysis to the task manager
  addPdfTasks(analysisResult, pdfFileName) {
    if (!analysisResult || !analysisResult.aiSuggestedTasks) {
      console.warn('No AI suggested tasks found in analysis result');
      return [];
    }

    const pdfTasks = analysisResult.aiSuggestedTasks.map((task, index) => ({
      id: `pdf-${uuidv4()}`,
      text: task.title || task.text || task.description,
      description: task.description || '',
      type: 'ai-pdf',
      source: 'pdf-analysis',
      fileName: pdfFileName,
      difficulty: task.difficulty || 'medium',
      estimatedHours: task.estimatedHours || task.estimated_hours || 1,
      points: task.points || this.calculatePoints(task),
      category: task.category || 'analysis',
      priority: task.priority || 'medium',
      order: index,
      completed: false,
      createdAt: new Date().toISOString(),
      milestone: task.milestone || null
    }));

    this.pdfTasks = [...this.pdfTasks, ...pdfTasks];
    this.notifyListeners('tasks-added', pdfTasks);
    
    return pdfTasks;
  }

  // Calculate points based on difficulty and estimated hours
  calculatePoints(task) {
    const basePoints = (task.estimatedHours || task.estimated_hours || 1) * 10;
    const difficultyMultiplier = {
      'easy': 1,
      'medium': 1.5,
      'hard': 2
    };
    
    const multiplier = difficultyMultiplier[task.difficulty] || 1;
    return Math.round(basePoints * multiplier);
  }

  // Get all PDF-generated tasks
  getPdfTasks() {
    return this.pdfTasks;
  }

  // Get tasks by source file
  getTasksByFile(fileName) {
    return this.pdfTasks.filter(task => task.fileName === fileName);
  }

  // Update task completion status
  updateTaskStatus(taskId, completed) {
    const taskIndex = this.pdfTasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
      this.pdfTasks[taskIndex].completed = completed;
      this.pdfTasks[taskIndex].completedAt = completed ? new Date().toISOString() : null;
      this.notifyListeners('task-updated', this.pdfTasks[taskIndex]);
      return this.pdfTasks[taskIndex];
    }
    return null;
  }

  // Subscribe to task updates
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners of changes
  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Error in task integration listener:', error);
      }
    });
  }

  // Clear all PDF tasks
  clearPdfTasks() {
    this.pdfTasks = [];
    this.notifyListeners('tasks-cleared', []);
  }

  // Get task statistics
  getTaskStats() {
    const total = this.pdfTasks.length;
    const completed = this.pdfTasks.filter(task => task.completed).length;
    const totalPoints = this.pdfTasks.reduce((sum, task) => sum + task.points, 0);
    const earnedPoints = this.pdfTasks
      .filter(task => task.completed)
      .reduce((sum, task) => sum + task.points, 0);

    return {
      total,
      completed,
      pending: total - completed,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      totalPoints,
      earnedPoints
    };
  }

  // Export tasks for integration with existing task manager
  getTasksForTaskManager() {
    return this.pdfTasks.map(task => ({
      id: task.id,
      text: task.text,
      type: 'ai-pdf',
      completed: task.completed,
      createdBy: 'AI Assistant',
      source: task.source,
      fileName: task.fileName,
      difficulty: task.difficulty,
      points: task.points,
      estimatedHours: task.estimatedHours,
      category: task.category,
      priority: task.priority
    }));
  }
}

// Create singleton instance
export const taskIntegrationService = new TaskIntegrationService();

export default TaskIntegrationService;