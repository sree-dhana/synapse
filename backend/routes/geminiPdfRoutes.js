const express = require('express');
const multer = require('multer');
const { analyzePdfWithGemini } = require('../controllers/geminiPdfController');

const router = express.Router();

/**
 * Configure multer for PDF file upload
 * Using memory storage to process files directly without saving to disk
 */
const upload = multer({
  // Store files in memory as Buffer objects
  storage: multer.memoryStorage(),
  
  // Set file size limits (15MB for PDFs)
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB maximum file size
    files: 1, // Only allow 1 file per request
    fields: 5 // Limit number of form fields
  },
  
  // File filtering to only allow PDF files
  fileFilter: (req, file, cb) => {
    console.log(`📁 File upload attempt: ${file.originalname}, Type: ${file.mimetype}`);
    
    // Check MIME type
    if (file.mimetype === 'application/pdf') {
      console.log('✅ PDF file accepted');
      cb(null, true);
    } else {
      console.log('❌ File rejected - not a PDF');
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

/**
 * POST /gemini-analyze-pdf
 * Main route for PDF analysis using Google Gemini API
 * 
 * @route POST /gemini-analyze-pdf
 * @access Public (add authentication middleware like validateToken if needed)
 * @description Upload PDF file and get AI-powered analysis including summary, roadmap, and tasks
 * 
 * Expected request:
 * - Content-Type: multipart/form-data
 * - Body: PDF file with field name 'pdf'
 * - Optional: Additional metadata fields
 * 
 * Response format:
 * {
 *   "success": true,
 *   "fileName": "document.pdf",
 *   "contentLength": 5432,
 *   "analysis": {
 *     "summary": {...},
 *     "roadmap": {...},
 *     "tasks": [...],
 *     "additionalResources": [...],
 *     "confidence": 0.85,
 *     "metadata": {...}
 *   },
 *   "timestamp": "2025-09-21T10:30:00.000Z"
 * }
 */
router.post('/gemini-analyze-pdf', 
  // Add authentication middleware here if needed
  // validateToken, 
  
  // Handle single file upload with field name 'pdf'
  upload.single('pdf'), 
  
  // Main controller function
  analyzePdfWithGemini
);

/**
 * GET /gemini-health
 * Health check endpoint to verify Gemini API connectivity
 */
router.get('/gemini-health', async (req, res) => {
  try {
    console.log('🏥 Gemini health check requested');
    
    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Gemini API key not configured',
        timestamp: new Date().toISOString()
      });
    }

    // Basic health response
    res.status(200).json({
      success: true,
      service: 'Gemini PDF Analyzer',
      status: 'healthy',
      apiKeyConfigured: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });

  } catch (error) {
    console.error('❌ Health check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Error handling middleware specifically for multer and file upload errors
 * This middleware catches errors that occur during file upload processing
 */
router.use((error, req, res, next) => {
  console.error('🚨 Route error occurred:', error.message);

  // Handle multer-specific errors
  if (error instanceof multer.MulterError) {
    let errorMessage = 'File upload error';
    let statusCode = 400;

    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        errorMessage = 'File too large. Maximum size is 15MB for PDF files.';
        break;
      case 'LIMIT_FILE_COUNT':
        errorMessage = 'Too many files. Please upload only one PDF file.';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        errorMessage = 'Unexpected file field. Please use field name "pdf".';
        break;
      case 'LIMIT_PART_COUNT':
        errorMessage = 'Too many parts in the multipart form.';
        break;
      case 'LIMIT_FIELD_COUNT':
        errorMessage = 'Too many fields in the form.';
        break;
      default:
        errorMessage = `Upload error: ${error.message}`;
    }

    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
      errorCode: error.code,
      timestamp: new Date().toISOString()
    });
  }

  // Handle file filter errors (non-PDF files)
  if (error.message === 'Only PDF files are allowed') {
    return res.status(400).json({
      success: false,
      error: 'Invalid file type. Only PDF files are accepted.',
      hint: 'Please ensure your file has a .pdf extension and is a valid PDF document.',
      timestamp: new Date().toISOString()
    });
  }

  // Handle other general errors
  return res.status(500).json({
    success: false,
    error: 'An unexpected error occurred during file processing.',
    details: error.message,
    timestamp: new Date().toISOString()
  });
});

/**
 * 404 handler for unmatched routes under this router
 */
router.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Gemini PDF analyzer endpoint not found',
    availableEndpoints: [
      'POST /gemini-analyze-pdf - Analyze PDF with Gemini AI',
      'GET /gemini-health - Check service health'
    ],
    timestamp: new Date().toISOString()
  });
});

module.exports = router;