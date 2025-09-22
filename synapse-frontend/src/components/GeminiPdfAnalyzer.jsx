import React, { useState, useRef } from 'react';
import { API_URL } from '../config/apiConfig';
import { SummaryDisplay, RoadmapDisplay, TasksDisplay, ResourcesDisplay } from './AnalysisDisplayComponents';
import './GeminiPdfAnalyzer.css';

/**
 * Gemini PDF Analyzer Component
 * Provides a complete interface for uploading PDFs and displaying AI-powered analysis
 */
const GeminiPdfAnalyzer = ({ onTasksGenerated, roomId, socket }) => {
  // State management for the component
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  // No local flag needed; TaskManager reflects state

  // Listen for room-wide analysis updates (for new joiners or when someone else analyzes)
  React.useEffect(() => {
    if (!socket) return;
    const handler = (payload) => {
      if (!payload || (payload.roomId && roomId && payload.roomId !== roomId)) return;
      const merged = {
        success: true,
        fileName: payload.fileName,
        contentLength: 0,
        analysis: payload.analysis,
        timestamp: payload.timestamp
      };
      setAnalysisResult(merged);
      // Optionally feed tasks into Task Manager for new joiners
      if (onTasksGenerated && payload.analysis?.tasks?.length) {
  onTasksGenerated(payload.analysis.tasks, payload.fileName);
      }
    };
    socket.on('room-analysis-updated', handler);
    return () => socket.off('room-analysis-updated', handler);
  }, [socket, roomId, onTasksGenerated]);
  
  // Ref for file input to enable programmatic control
  const fileInputRef = useRef(null);

  /**
   * Handle file selection from input
   * @param {Event} event - File input change event
   */
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    
    // Reset previous states
    setError(null);
    setAnalysisResult(null);
    setUploadProgress(0);

    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        setError('Please select a valid PDF file');
        setSelectedFile(null);
        return;
      }

      // Validate file size (15MB limit)
      const maxSize = 15 * 1024 * 1024; // 15MB in bytes
      if (file.size > maxSize) {
        setError('File size must be less than 15MB');
        setSelectedFile(null);
        return;
      }

      console.log('📄 File selected:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2) + 'MB');
      setSelectedFile(file);
    }
  };

  /**
   * Handle drag and drop functionality
   */
  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer.files;
    if (files && files[0]) {
      // Simulate file input change event
      const simulatedEvent = {
        target: { files: [files[0]] }
      };
      handleFileSelect(simulatedEvent);
    }
  };

  /**
   * Clear selected file and reset component state
   */
  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
    setAnalysisResult(null);
    setUploadProgress(0);
  // no-op
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Handle sending tasks to task manager
   */
  const handleSendTasksToManager = (tasks) => {
    if (onTasksGenerated && tasks && tasks.length > 0) {
      console.log('📋 Sending tasks to Task Manager:', tasks);
  onTasksGenerated(tasks, selectedFile?.name);
      
      // Show success notification
      alert(`✅ ${tasks.length} tasks have been added to your Task Manager!`);
    }
  };

  /**
   * Main function to analyze PDF using Gemini API
   */
  const analyzePdf = async () => {
    if (!selectedFile) {
      setError('Please select a PDF file first');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setUploadProgress(0);

    try {
      console.log('🚀 Starting PDF analysis with Gemini...');

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('pdf', selectedFile);

      // Simulate upload progress (since we can't track real progress easily with fetch)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // To include roomId, use XMLHttpRequest to append extra fields in multipart
      const formWithRoom = new FormData();
      formWithRoom.append('pdf', selectedFile);
      if (roomId) formWithRoom.append('roomId', roomId);

      // Make API call to backend
      const response = await fetch(`${API_URL}/gemini-analyze-pdf`, {
        method: 'POST',
        body: formWithRoom,
        // Don't set Content-Type header - let browser set it with boundary for multipart/form-data
      });

      // Clear progress interval
      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ Analysis completed successfully');
        setAnalysisResult(data);
        setError(null);
      } else {
        console.error('❌ Analysis failed:', data.error);
        setError(data.error || 'Analysis failed. Please try again.');
        setAnalysisResult(null);
      }

    } catch (err) {
      console.error('🚨 Network error during analysis:', err);
      setError('Network error occurred. Please check your connection and try again.');
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
      setUploadProgress(0);
    }
  };

  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} - Formatted file size
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="gemini-pdf-analyzer">
      <div className="analyzer-header">
        <h1>🤖 AI-Powered PDF Analyzer</h1>
        <p>Upload your PDF and get intelligent analysis with learning roadmaps and actionable tasks</p>
      </div>

      {/* File Upload Section */}
      <div className="upload-section">
        <div 
          className={`upload-area ${selectedFile ? 'has-file' : ''}`}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          {!selectedFile ? (
            <div className="upload-prompt">
              <div className="upload-icon">📄</div>
              <h3>Drop your PDF here or click to browse</h3>
              <p>Maximum file size: 15MB</p>
              <button type="button" className="browse-button">
                Choose PDF File
              </button>
            </div>
          ) : (
            <div className="file-info">
              <div className="file-icon">📄</div>
              <div className="file-details">
                <h4>{selectedFile.name}</h4>
                <p>{formatFileSize(selectedFile.size)}</p>
              </div>
              <button 
                type="button" 
                className="clear-button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            onClick={analyzePdf}
            disabled={!selectedFile || isAnalyzing}
            className={`analyze-button ${isAnalyzing ? 'analyzing' : ''}`}
          >
            {isAnalyzing ? (
              <>
                <span className="spinner"></span>
                Analyzing with AI...
              </>
            ) : (
              '🧠 Analyze PDF'
            )}
          </button>

          {selectedFile && !isAnalyzing && (
            <button onClick={clearFile} className="clear-button-alt">
              Clear File
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {isAnalyzing && (
          <div className="progress-section">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="progress-text">
              {uploadProgress < 100 
                ? `Uploading... ${uploadProgress}%` 
                : 'Processing with Gemini AI...'
              }
            </p>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-section">
          <div className="error-card">
            <div className="error-icon">⚠️</div>
            <div className="error-content">
              <h4>Error</h4>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {analysisResult && (
        <div className="results-section">
          <h2>📊 Analysis Results</h2>
          
          {/* Analysis metadata */}
          <div className="analysis-metadata">
            <div className="metadata-item">
              <strong>📄 File:</strong> {analysisResult.fileName}
            </div>
            <div className="metadata-item">
              <strong>📝 Content Length:</strong> {analysisResult.contentLength.toLocaleString()} characters
            </div>
            <div className="metadata-item">
              <strong>🕒 Analyzed:</strong> {new Date(analysisResult.timestamp).toLocaleString()}
            </div>
            <div className="metadata-item">
              <strong>🎯 Confidence:</strong> {Math.round(analysisResult.analysis.confidence * 100)}%
            </div>
          </div>

          {/* Summary Section */}
          <SummaryDisplay summary={analysisResult.analysis.summary} />

          {/* Roadmap Section */}
          <RoadmapDisplay roadmap={analysisResult.analysis.roadmap} />

          {/* Tasks Section */}
          <TasksDisplay 
            tasks={analysisResult.analysis.tasks} 
            onSendToTaskManager={handleSendTasksToManager}
          />

          {/* Additional Resources */}
          {analysisResult.analysis.additionalResources?.length > 0 && (
            <ResourcesDisplay resources={analysisResult.analysis.additionalResources} />
          )}
        </div>
      )}
    </div>
  );
};

export default GeminiPdfAnalyzer;