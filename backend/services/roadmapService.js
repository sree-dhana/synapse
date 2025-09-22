require("dotenv").config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateRoadmap(text) {
  console.log(">>> Starting generateRoadmap with Gemini AI");
  console.log("Text length:", text.length);

  try {
    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an expert learning designer. Convert this document into a JSON roadmap with this structure:

{
  "summary": "string",
  "learningObjectives": ["string"],
  "roadmap": [
    {
      "milestone_id": "string",
      "title": "string",
      "description": "string",
      "estimated_hours": 2,
      "priority": "low|medium|high",
      "tasks": [
        {
          "task_id": "string",
          "title": "string",
          "description": "string",
          "estimated_hours": 1,
          "points": 10
        }
      ]
    }
  ],
  "hints": ["string"],
  "confidence": 0.8
}

Respond ONLY in valid JSON. No extra text outside the JSON.
Document:
${text}
`;

    console.log(">>> Sending request to Gemini AI");
    
    // Generate content using Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    console.log(">>> Gemini AI response received");
    console.log(">>> Raw content length:", content.length);

    try {
      // Try to parse JSON directly
      return JSON.parse(content);
    } catch (parseError) {
      console.log(">>> Direct JSON parse failed, trying to extract JSON...");
      
      // Try to extract JSON from the response
      const match = content.match(/{[\s\S]*}/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch (extractError) {
          console.log(">>> JSON extraction also failed");
        }
      }

      console.error("Gemini parse error: Could not parse JSON\nRaw content:\n", content);
      
      // Return fallback structure
      return {
        summary: content.slice(0, 500) || "Could not extract roadmap.",
        learningObjectives: [],
        roadmap: [],
        hints: [],
        confidence: 0.2,
      };
    }
  } catch (err) {
    console.error("Gemini request failed:", err);
    return {
      summary: "Could not extract roadmap due to request error.",
      learningObjectives: [],
      roadmap: [],
      hints: [],
      confidence: 0.1,
    };
  }
}

module.exports = { generateRoadmap };
