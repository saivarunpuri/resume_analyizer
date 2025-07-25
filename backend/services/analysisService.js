// backend/services/analysisService.js
const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- MODIFICATION START ---
// Enable JSON Mode by setting the responseMimeType in the generationConfig.
// This ensures the model's output is always a valid JSON string.
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
    },
});
// --- MODIFICATION END ---


const extractTextFromPdf = async (buffer) => {
    try {
        const data = await pdf(buffer);
        return data.text;
    } catch (error) {
        console.error("Error parsing PDF:", error);
        throw new Error("Failed to extract text from PDF.");
    }
};

const analyzeResumeWithGemini = async (resumeText) => {
    const prompt = `
    You are an expert resume analyzer. Your task is to extract key information from the provided resume text and then provide a comprehensive analysis, including a rating, areas for improvement, and suggested skills for upskilling.

    The output MUST be a single JSON object. Ensure all fields are present, using null or empty arrays if information is not found. For arrays, ensure they are always arrays, even if empty.

    Here's the resume text:
    ---
    ${resumeText}
    ---

    Please provide the analysis in the following JSON format:

    {
      "contact_info": {
        "name": "string | null",
        "email": "string | null",
        "phone": "string | null",
        "linkedin": "string | null",
        "github": "string | null",
        "portfolio": "string | null",
        "address": "string | null"
      },
      "summary_objective": "string | null",
      "work_experience": [
        {
          "title": "string | null",
          "company": "string | null",
          "location": "string | null",
          "dates": "string | null",
          "description_points": ["string"]
        }
      ],
      "education": [
        {
          "degree": "string | null",
          "institution": "string | null",
          "location": "string | null",
          "dates": "string | null",
          "gpa": "string | null"
        }
      ],
      "skills": {
        "technical": ["string"],
        "soft": ["string"],
        "tools": ["string"],
        "languages": ["string"]
      },
      "projects": [
        {
          "name": "string | null",
          "description": "string | null",
          "technologies": ["string"]
        }
      ],
      "awards_certifications": ["string"],
      "resume_analysis": {
        "rating_out_of_10": "number | null (e.g., 7.5)",
        "strengths": ["string"],
        "weaknesses": ["string"],
        "areas_for_improvement": ["string"],
        "suggested_upskilling_skills": ["string"],
        "general_feedback": "string | null"
      }
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // --- MODIFICATION START ---
        // With JSON mode enabled, the robust parsing logic is no longer necessary.
        // The 'text' variable is guaranteed to be a parsable JSON string.
        const parsedData = JSON.parse(text);
        // --- MODIFICATION END ---

        return parsedData;
    } catch (error) {
        console.error("Error analyzing resume with Gemini:", error.message);
        // This detailed logging is still very useful for debugging other potential issues.
        console.error("Gemini raw response (if available):", error.response?.text());
        throw new Error(`Failed to get analysis from AI. Error: ${error.message}`);
    }
};

module.exports = {
    extractTextFromPdf,
    analyzeResumeWithGemini
};
