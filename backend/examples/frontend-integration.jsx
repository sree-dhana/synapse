/**
 * Frontend Example: How to use the PDF Analyzer API
 * 
 * This file shows how to integrate the /analyze-pdf endpoint
 * with your React frontend
 */

import { useState } from 'react';

const PdfAnalyzer = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setError(null);
    } else {
      setError('Please select a valid PDF file');
      setSelectedFile(null);
    }
  };

  const analyzePdf = async () => {
    if (!selectedFile) {
      setError('Please select a PDF file first');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('pdf', selectedFile);

      // Call the API endpoint
      const response = await fetch('https://synapse-a7uk.onrender.com/api/analyze-pdf', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let browser set it with boundary
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
        console.log('PDF Analysis Result:', data);
      } else {
        setError(data.error || 'Analysis failed');
      }

    } catch (err) {
      console.error('Error analyzing PDF:', err);
      setError('Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pdf-analyzer">
      <h2>PDF Analyzer</h2>
      
      {/* File Upload */}
      <div className="upload-section">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          disabled={loading}
        />
        <button 
          onClick={analyzePdf} 
          disabled={!selectedFile || loading}
        >
          {loading ? 'Analyzing...' : 'Analyze PDF'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error">
          <p style={{ color: 'red' }}>{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading">
          <p>Uploading and analyzing PDF...</p>
          <p>This may take a few moments...</p>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="results">
          <h3>Analysis Results</h3>
          
          {/* Summary */}
          <div className="summary">
            <h4>Summary</h4>
            <p>{result.summary}</p>
          </div>

          {/* Roadmap */}
          <div className="roadmap">
            <h4>Learning Roadmap</h4>
            <p><strong>Title:</strong> {result.roadmap.title}</p>
            <p><strong>Total Hours:</strong> {result.roadmap.totalEstimatedHours}</p>
            
            <h5>Milestones:</h5>
            {result.roadmap.milestones.map((milestone) => (
              <div key={milestone.id} className="milestone">
                <h6>{milestone.title}</h6>
                <p>{milestone.description}</p>
                <p>
                  <strong>Priority:</strong> {milestone.priority} | 
                  <strong> Hours:</strong> {milestone.estimatedHours}
                </p>
              </div>
            ))}
          </div>

          {/* Tasks */}
          <div className="tasks">
            <h4>Recommended Tasks</h4>
            {result.tasks.map((task) => (
              <div key={task.id} className="task">
                <h6>{task.title}</h6>
                <p>{task.description}</p>
                <p>
                  <strong>Hours:</strong> {task.estimatedHours} | 
                  <strong> Points:</strong> {task.points}
                </p>
              </div>
            ))}
          </div>

          {/* Metadata */}
          <div className="metadata">
            <h5>Analysis Info</h5>
            <p><strong>File:</strong> {result.fileName}</p>
            <p><strong>Doc ID:</strong> {result.docId}</p>
            <p><strong>Analyzed:</strong> {new Date(result.timestamp).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfAnalyzer;

/**
 * Alternative API call using async/await with error handling
 */
export const analyzePdfFile = async (file) => {
  if (!file || file.type !== 'application/pdf') {
    throw new Error('Invalid file type. Please provide a PDF file.');
  }

  const formData = new FormData();
  formData.append('pdf', file);

  try {
    const response = await fetch('https://synapse-a7uk.onrender.com/api/analyze-pdf', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `HTTP ${response.status}`);
    }

    if (!result.success) {
      throw new Error(result.error || 'Analysis failed');
    }

    return result;

  } catch (error) {
    console.error('PDF analysis error:', error);
    throw error;
  }
};

/**
 * CSS Styles (add to your CSS file)
 */
const sampleCSS = `
.pdf-analyzer {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.upload-section {
  margin-bottom: 20px;
  padding: 20px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  text-align: center;
}

.upload-section input[type="file"] {
  margin-bottom: 10px;
}

.upload-section button {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.upload-section button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error {
  margin: 10px 0;
}

.loading {
  text-align: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.results {
  margin-top: 20px;
}

.milestone, .task {
  background-color: #f8f9fa;
  padding: 15px;
  margin: 10px 0;
  border-radius: 4px;
  border-left: 4px solid #007bff;
}

.metadata {
  margin-top: 20px;
  padding: 15px;
  background-color: #e9ecef;
  border-radius: 4px;
}
`;