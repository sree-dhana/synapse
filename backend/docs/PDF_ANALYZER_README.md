# PDF Analyzer API Documentation

## Overview

The PDF Analyzer API integrates with PDF.ai to provide comprehensive PDF analysis, including document summarization, learning roadmap generation, and task recommendations.

## Features

- ✅ PDF file upload and validation
- ✅ Integration with PDF.ai API for document processing
- ✅ Automatic summary generation
- ✅ Learning roadmap creation based on content
- ✅ Task recommendations with time estimates
- ✅ Comprehensive error handling
- ✅ File size and type validation

## API Endpoint

### POST `/api/analyze-pdf`

Uploads a PDF file, processes it through PDF.ai, and returns analysis results.

#### Request

- **Method:** POST
- **Content-Type:** multipart/form-data
- **Body:** PDF file with field name `pdf`
- **Max File Size:** 10MB
- **Allowed Types:** PDF only

#### Response

```json
{
  "success": true,
  "docId": "pdf-ai-document-id",
  "fileName": "document.pdf",
  "summary": "AI-generated summary of the PDF content...",
  "roadmap": {
    "title": "Learning Roadmap",
    "description": "Generated roadmap based on PDF content",
    "totalEstimatedHours": 15,
    "milestones": [
      {
        "id": "milestone_1",
        "title": "Introduction to Topic",
        "description": "Learn the fundamentals...",
        "estimatedHours": 5,
        "priority": "high",
        "order": 1
      }
    ]
  },
  "tasks": [
    {
      "id": "task_1",
      "milestoneId": "milestone_1",
      "title": "Read Chapter 1",
      "description": "Complete the introductory material...",
      "estimatedHours": 2,
      "points": 30,
      "status": "pending",
      "order": 1
    }
  ],
  "timestamp": "2025-09-21T10:30:00.000Z"
}
```

#### Error Response

```json
{
  "success": false,
  "error": "Error message description",
  "timestamp": "2025-09-21T10:30:00.000Z"
}
```

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in your backend directory:

```bash
# PDF.ai API Key (required)
PDF_AI_API_KEY=your_pdf_ai_api_key_here

# Other environment variables
PORT=5000
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

The following dependencies are required:
- `express` - Web framework
- `multer` - File upload handling
- `node-fetch` - HTTP requests
- `form-data` - Form data creation
- `dotenv` - Environment variables

### 3. API Key Setup

1. Sign up at [PDF.ai](https://pdf.ai/)
2. Get your API key from the dashboard
3. Add it to your `.env` file as `PDF_AI_API_KEY`

### 4. Start the Server

```bash
npm start
# or for development
npm run dev
```

## Usage Examples

### Frontend Integration (React)

```javascript
import { useState } from 'react';

const PdfUploader = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await fetch('/api/analyze-pdf', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data);
      } else {
        console.error('Analysis failed:', data.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleUpload} disabled={!file || loading}>
        {loading ? 'Analyzing...' : 'Upload & Analyze'}
      </button>
      
      {result && (
        <div>
          <h3>Summary:</h3>
          <p>{result.summary}</p>
          
          <h3>Roadmap:</h3>
          {result.roadmap.milestones.map(milestone => (
            <div key={milestone.id}>
              <h4>{milestone.title}</h4>
              <p>{milestone.description}</p>
            </div>
          ))}
          
          <h3>Tasks:</h3>
          {result.tasks.map(task => (
            <div key={task.id}>
              <h5>{task.title}</h5>
              <p>{task.description}</p>
              <p>Time: {task.estimatedHours}h | Points: {task.points}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### cURL Example

```bash
curl -X POST \
  http://localhost:5000/api/analyze-pdf \
  -H "Content-Type: multipart/form-data" \
  -F "pdf=@/path/to/your/document.pdf"
```

### JavaScript/Node.js Example

```javascript
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

async function analyzePdf(filePath) {
  const formData = new FormData();
  formData.append('pdf', fs.createReadStream(filePath));

  const response = await fetch('http://localhost:5000/api/analyze-pdf', {
    method: 'POST',
    body: formData
  });

  const result = await response.json();
  return result;
}

// Usage
analyzePdf('./document.pdf')
  .then(result => console.log(result))
  .catch(error => console.error(error));
```

## Error Handling

The API handles various error scenarios:

### File Validation Errors
- **Missing file:** `PDF file is required`
- **Wrong file type:** `Only PDF files are allowed`
- **File too large:** `File too large. Maximum size is 10MB`

### API Errors
- **PDF.ai upload failed:** `Failed to upload PDF: [details]`
- **Summary extraction failed:** `Failed to get PDF summary: [details]`
- **Roadmap generation failed:** `Failed to generate roadmap: [details]`

### Network Errors
- **Connection issues:** `Failed to analyze PDF`
- **Invalid API key:** Check your PDF_AI_API_KEY

## File Structure

```
backend/
├── controllers/
│   └── pdfAnalyzerController.js    # Main controller logic
├── routes/
│   └── pdfAnalyzerRoutes.js        # Route definitions
├── examples/
│   └── frontend-integration.jsx    # Frontend example
├── .env.example                    # Environment template
└── server.js                      # Updated with new routes
```

## Testing

You can test the API using:

1. **Postman:** Import the endpoint and test with PDF files
2. **Frontend:** Use the provided React component
3. **cURL:** Use the command-line examples above
4. **Browser:** Create a simple HTML form for testing

## Troubleshooting

### Common Issues

1. **"PDF file is required"**
   - Ensure you're sending the file with field name `pdf`
   - Check that the file is actually selected

2. **"Only PDF files are allowed"**
   - Verify the file has `.pdf` extension
   - Check the MIME type is `application/pdf`

3. **"File too large"**
   - Reduce file size or compress the PDF
   - Current limit is 10MB

4. **API Key Issues**
   - Verify your PDF_AI_API_KEY is correct
   - Check that the API key has proper permissions

5. **Network Errors**
   - Ensure the backend server is running
   - Check firewall and network connectivity
   - Verify PDF.ai service is accessible

### Debug Mode

Enable detailed logging by setting:
```bash
NODE_ENV=development
```

## Performance Considerations

- **File Size:** Larger PDFs take longer to process
- **API Limits:** PDF.ai may have rate limits
- **Memory Usage:** Files are stored in memory during processing
- **Timeout:** Consider implementing timeouts for long operations

## Security Notes

- Always validate uploaded files
- Implement authentication if needed
- Store API keys securely
- Consider rate limiting for production use
- Sanitize file names and paths

## License

This project is licensed under the MIT License.