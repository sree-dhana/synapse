const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdf = require('pdf-parse');
const RoomAnalysis = require('../models/RoomAnalysis');

/**
 * Gemini PDF Analyzer Controller
 * Handles PDF upload, content extraction, and analysis using Google Gemini API
 */

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Main controller function to analyze PDF using Gemini API
 * @route POST /gemini-analyze-pdf
 * @access Public (add authentication middleware if needed)
 */
const analyzePdfWithGemini = async (req, res) => {
  try {
    console.log('🚀 Starting Gemini PDF analysis...');
    
    // Step 1: Validate PDF file upload
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'PDF file is required',
        timestamp: new Date().toISOString()
      });
    }

    const pdfBuffer = req.file.buffer;
    const fileName = req.file.originalname;

    console.log(`📄 Processing PDF: ${fileName}, Size: ${pdfBuffer.length} bytes`);

    // Step 2: Extract text content from PDF
    const pdfText = await extractTextFromPDF(pdfBuffer);
    console.log(`📝 Extracted text length: ${pdfText.length} characters`);

    if (!pdfText || pdfText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        error: 'PDF contains insufficient readable text content',
        timestamp: new Date().toISOString()
      });
    }

    // Step 3: Generate analysis using Gemini API
    const analysisResult = await generateAnalysisWithGemini(pdfText, fileName);
    console.log('✅ Gemini analysis completed successfully');

    // Step 4: If roomId provided, persist and broadcast to room
    const { roomId } = req.body || {};
    if (roomId) {
      try {
        await RoomAnalysis.findOneAndUpdate(
          { roomId },
          { roomId, fileName, analysis: analysisResult, lastUpdated: new Date() },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Broadcast to room if socket.io is available on app
        const io = req.app.get('io');
        if (io) {
          io.to(roomId).emit('room-analysis-updated', {
            roomId,
            fileName,
            analysis: analysisResult,
            timestamp: new Date().toISOString()
          });
          console.log(`📡 Emitted room-analysis-updated to room ${roomId}`);
        }
      } catch (persistErr) {
        console.error('⚠️ Failed to persist/broadcast room analysis:', persistErr.message);
      }
    }

    // Step 5: Format and return response
    const response = {
      success: true,
      fileName: fileName,
      contentLength: pdfText.length,
      analysis: analysisResult,
      timestamp: new Date().toISOString()
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('❌ Gemini PDF analysis error:', error);
    
    // Return comprehensive error response
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze PDF with Gemini',
      errorType: error.name || 'UnknownError',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Extract text content from PDF buffer using pdf-parse
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @returns {string} - Extracted text content
 */
async function extractTextFromPDF(pdfBuffer) {
  try {
    console.log('📖 Extracting text from PDF...');
    
    // Use pdf-parse to extract text from PDF buffer
    const pdfData = await pdf(pdfBuffer);
    
    if (!pdfData.text) {
      throw new Error('No text content found in PDF');
    }

    // Clean and normalize the extracted text
    const cleanText = pdfData.text
      .replace(/\s+/g, ' ')  // Replace multiple whitespace with single space
      .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
      .trim();

    console.log(`✅ Text extraction successful. Pages: ${pdfData.numpages}`);
    return cleanText;

  } catch (error) {
    console.error('❌ PDF text extraction failed:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

/**
 * Generate comprehensive analysis using Google Gemini API
 * @param {string} pdfText - Extracted PDF text content
 * @param {string} fileName - Original PDF file name
 * @returns {Object} - Analysis results with summary, roadmap, and tasks
 */
async function generateAnalysisWithGemini(pdfText, fileName) {
  try {
    console.log('🤖 Generating analysis with Gemini AI...');

    // Get the Gemini model (using gemini-1.5-flash for text analysis)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create comprehensive prompt for analysis
    const analysisPrompt = createAnalysisPrompt(pdfText, fileName);

    // Generate content using Gemini API
    const result = await model.generateContent(analysisPrompt);
    const response = await result.response;
    const analysisText = response.text();

    console.log('📊 Raw Gemini response received, parsing JSON...');

    // Parse the JSON response from Gemini
    const parsedAnalysis = parseGeminiResponse(analysisText);
    
    // Validate and enhance the analysis structure
    const enhancedAnalysis = enhanceAnalysisStructure(parsedAnalysis, fileName);

    console.log('✅ Analysis parsing and enhancement completed');
    return enhancedAnalysis;

  } catch (error) {
    console.error('❌ Gemini API analysis failed:', error);
    
    // Return fallback analysis if Gemini fails
    return createFallbackAnalysis(pdfText, fileName);
  }
}

/**
 * Create a comprehensive prompt for Gemini analysis
 * @param {string} pdfText - PDF content
 * @param {string} fileName - File name for context
 * @returns {string} - Formatted prompt
 */
function createAnalysisPrompt(pdfText, fileName) {
  return `
You are an expert educational content analyzer. Analyze the following PDF document and provide a comprehensive learning analysis.

Document Name: ${fileName}
Document Content:
${pdfText.substring(0, 8000)} ${pdfText.length > 8000 ? '...(truncated)' : ''}

Please provide your analysis in the following EXACT JSON format (no additional text outside the JSON):

{
  "summary": {
    "overview": "A comprehensive 3-4 sentence summary of the main content and purpose",
    "keyTopics": ["topic1", "topic2", "topic3"],
    "difficulty": "beginner|intermediate|advanced",
    "estimatedReadingTime": "X minutes"
  },
  "roadmap": {
    "title": "Learning Roadmap for [Document Topic]",
    "description": "Brief description of the learning path",
    "totalEstimatedHours": 0,
    "milestones": [
      {
        "id": 1,
        "title": "Milestone Title",
        "description": "What will be accomplished in this milestone",
        "estimatedHours": 2,
        "priority": "high|medium|low",
        "order": 1,
        "prerequisites": ["prerequisite1", "prerequisite2"],
        "learningOutcomes": ["outcome1", "outcome2"]
      }
    ]
  },
  "tasks": [
    {
      "id": 1,
      "title": "Specific actionable task",
      "description": "Detailed description of what to do",
      "category": "reading|practice|research|review",
      "estimatedTime": "X minutes",
      "difficulty": "easy|medium|hard",
      "points": 10,
      "milestoneId": 1,
      "order": 1
    }
  ],
  "additionalResources": [
    {
      "title": "Resource title",
      "type": "article|video|book|course",
      "description": "Why this resource is helpful",
      "url": "optional"
    }
  ],
  "confidence": 0.85
}

Ensure the analysis is:
1. Directly related to the document content
2. Provides actionable learning steps
3. Includes realistic time estimates
4. Covers beginner to advanced concepts progressively
5. Contains 5-8 milestones and 15-25 tasks
6. Is practical and implementable

Respond ONLY with valid JSON. No other text.
`;
}

/**
 * Parse Gemini response and extract JSON
 * @param {string} responseText - Raw Gemini response
 * @returns {Object} - Parsed analysis object
 */
function parseGeminiResponse(responseText) {
  try {
    // Clean the response text
    let cleanedResponse = responseText.trim();
    
    // Remove any markdown code blocks if present
    cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Try to parse as JSON
    const parsed = JSON.parse(cleanedResponse);
    console.log('✅ Successfully parsed Gemini JSON response');
    return parsed;

  } catch (error) {
    console.warn('⚠️ JSON parsing failed, attempting to extract JSON from text...');
    
    // Try to extract JSON from the response text
    const jsonMatch = responseText.match(/{[\s\S]*}/);
    if (jsonMatch) {
      try {
        const extracted = JSON.parse(jsonMatch[0]);
        console.log('✅ Successfully extracted JSON from Gemini response');
        return extracted;
      } catch (extractError) {
        console.error('❌ JSON extraction also failed');
      }
    }
    
    throw new Error('Failed to parse Gemini response as JSON');
  }
}

/**
 * Enhance and validate the analysis structure
 * @param {Object} analysis - Parsed analysis from Gemini
 * @param {string} fileName - Original file name
 * @returns {Object} - Enhanced analysis structure
 */
function enhanceAnalysisStructure(analysis, fileName) {
  // Ensure required structure exists
  const enhanced = {
    summary: analysis.summary || {},
    roadmap: analysis.roadmap || {},
    tasks: analysis.tasks || [],
    additionalResources: analysis.additionalResources || [],
    confidence: analysis.confidence || 0.7,
    metadata: {
      analyzedDocument: fileName,
      analysisDate: new Date().toISOString(),
      generatedBy: 'Google Gemini API',
      version: '1.0'
    }
  };

  // Validate and set defaults for summary
  enhanced.summary = {
    overview: enhanced.summary.overview || 'Document analysis completed',
    keyTopics: enhanced.summary.keyTopics || [],
    difficulty: enhanced.summary.difficulty || 'intermediate',
    estimatedReadingTime: enhanced.summary.estimatedReadingTime || '15 minutes'
  };

  // Validate and enhance roadmap
  enhanced.roadmap = {
    title: enhanced.roadmap.title || `Learning Path for ${fileName}`,
    description: enhanced.roadmap.description || 'Structured learning approach based on document content',
    totalEstimatedHours: enhanced.roadmap.totalEstimatedHours || 0,
    milestones: enhanced.roadmap.milestones || []
  };

  // Calculate total hours if not provided
  if (enhanced.roadmap.totalEstimatedHours === 0 && enhanced.roadmap.milestones.length > 0) {
    enhanced.roadmap.totalEstimatedHours = enhanced.roadmap.milestones.reduce(
      (total, milestone) => total + (milestone.estimatedHours || 0), 0
    );
  }

  // Validate tasks structure
  enhanced.tasks = enhanced.tasks.map((task, index) => ({
    id: task.id || index + 1,
    title: task.title || `Task ${index + 1}`,
    description: task.description || 'Complete this learning task',
    category: task.category || 'reading',
    estimatedTime: task.estimatedTime || '30 minutes',
    difficulty: task.difficulty || 'medium',
    points: task.points || 10,
    milestoneId: task.milestoneId || 1,
    order: task.order || index + 1,
    completed: false // Add completion tracking
  }));

  console.log(`✅ Enhanced analysis structure with ${enhanced.roadmap.milestones.length} milestones and ${enhanced.tasks.length} tasks`);
  return enhanced;
}

/**
 * Create a fallback analysis when Gemini API fails
 * @param {string} pdfText - Original PDF text
 * @param {string} fileName - File name
 * @returns {Object} - Basic fallback analysis
 */
function createFallbackAnalysis(pdfText, fileName) {
  console.log('🔄 Creating fallback analysis due to Gemini API failure...');
  
  const wordCount = pdfText.split(/\s+/).length;
  const estimatedReadingTime = Math.ceil(wordCount / 200); // Average 200 words per minute

  return {
    summary: {
      overview: 'This document has been uploaded and is ready for analysis. The content appears to contain educational or informational material.',
      keyTopics: ['Document Content', 'Learning Material'],
      difficulty: 'intermediate',
      estimatedReadingTime: `${estimatedReadingTime} minutes`
    },
    roadmap: {
      title: `Study Plan for ${fileName}`,
      description: 'A basic learning approach for the uploaded document',
      totalEstimatedHours: 3,
      milestones: [
        {
          id: 1,
          title: 'Initial Review',
          description: 'Read through the document and identify key concepts',
          estimatedHours: 1,
          priority: 'high',
          order: 1,
          prerequisites: [],
          learningOutcomes: ['Understanding of main concepts']
        },
        {
          id: 2,
          title: 'Deep Study',
          description: 'Detailed analysis and note-taking',
          estimatedHours: 2,
          priority: 'medium',
          order: 2,
          prerequisites: ['Initial Review'],
          learningOutcomes: ['Comprehensive understanding']
        }
      ]
    },
    tasks: [
      {
        id: 1,
        title: 'Read the Document',
        description: 'Thoroughly read through the entire document',
        category: 'reading',
        estimatedTime: `${estimatedReadingTime} minutes`,
        difficulty: 'easy',
        points: 20,
        milestoneId: 1,
        order: 1,
        completed: false
      },
      {
        id: 2,
        title: 'Take Notes',
        description: 'Create summary notes of key points',
        category: 'practice',
        estimatedTime: '30 minutes',
        difficulty: 'medium',
        points: 30,
        milestoneId: 2,
        order: 2,
        completed: false
      }
    ],
    additionalResources: [],
    confidence: 0.5,
    metadata: {
      analyzedDocument: fileName,
      analysisDate: new Date().toISOString(),
      generatedBy: 'Fallback Analysis System',
      version: '1.0',
      note: 'Generated using fallback system due to API limitations'
    }
  };
}

module.exports = {
  analyzePdfWithGemini
};