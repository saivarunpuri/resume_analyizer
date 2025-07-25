const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { pool, testConnection, initializeTables } = require('./db/database');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Helper function to extract text from PDF
const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    throw new Error('Failed to extract text from PDF: ' + error.message);
  }
};

// Helper function to analyze resume with Gemini AI
const analyzeResumeWithAI = async (resumeText) => {
  try {
    const prompt = `
    Analyze the following resume text and extract structured information. Return a valid JSON object with the following structure:

    {
      "personal_details": {
        "name": "Full Name",
        "email": "email@example.com",
        "phone": "phone number",
        "linkedin": "LinkedIn URL if available",
        "portfolio": "Portfolio URL if available",
        "location": "City, State/Country if available"
      },
      "resume_content": {
        "summary": "Professional summary or objective",
        "work_experience": [
          {
            "company": "Company Name",
            "position": "Job Title",
            "duration": "Start Date - End Date",
            "responsibilities": ["responsibility 1", "responsibility 2"]
          }
        ],
        "education": [
          {
            "degree": "Degree Name",
            "institution": "University/School Name",
            "year": "Graduation Year",
            "gpa": "GPA if available"
          }
        ],
        "projects": [
          {
            "name": "Project Name",
            "description": "Project description",
            "technologies": ["tech1", "tech2"]
          }
        ],
        "certifications": [
          {
            "name": "Certification Name",
            "issuer": "Issuing Organization",
            "date": "Date obtained"
          }
        ]
      },
      "skills": {
        "technical_skills": ["skill1", "skill2", "skill3"],
        "soft_skills": ["skill1", "skill2", "skill3"]
      },
      "ai_feedback": {
        "rating": 8,
        "rating_explanation": "Explanation of the rating",
        "improvement_areas": [
          "Specific area for improvement 1",
          "Specific area for improvement 2"
        ],
        "suggested_skills": [
          "Skill to learn for career advancement 1",
          "Skill to learn for career advancement 2"
        ],
        "strengths": [
          "Notable strength 1",
          "Notable strength 2"
        ]
      }
    }

    Resume Text:
    ${resumeText}

    Please analyze this resume thoroughly and provide detailed, constructive feedback. Focus on:
    1. Extracting accurate personal and professional information
    2. Identifying both technical and soft skills
    3. Providing a fair rating (1-10) based on resume quality, content, and presentation
    4. Suggesting specific areas for improvement
    5. Recommending relevant skills for career growth
    6. Highlighting key strengths

    Return only the JSON object, no additional text.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up the response to ensure it's valid JSON
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/, '').replace(/\n?```$/, '');
    }
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/, '').replace(/\n?```$/, '');
    }
    
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('AI Analysis Error:', error);
    throw new Error('Failed to analyze resume with AI: ' + error.message);
  }
};

// Routes

// Upload and analyze resume
app.post('/api/resumes/upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;

    // Extract text from PDF
    const resumeText = await extractTextFromPDF(filePath);
    
    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ error: 'Could not extract text from PDF' });
    }

    // Analyze with AI
    const analysis = await analyzeResumeWithAI(resumeText);

    // Save to database
    const query = `
      INSERT INTO resumes (file_name, personal_details, resume_content, skills, ai_feedback)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, created_at
    `;
    
    const values = [
      originalName,
      JSON.stringify(analysis.personal_details),
      JSON.stringify(analysis.resume_content),
      JSON.stringify(analysis.skills),
      JSON.stringify(analysis.ai_feedback)
    ];

    const result = await pool.query(query, values);
    
    // Clean up uploaded file
    fs.unlinkSync(filePath);

    // Return analysis with database ID
    res.json({
      id: result.rows[0].id,
      filename: originalName,
      created_at: result.rows[0].created_at,
      ...analysis
    });

  } catch (error) {
    console.error('Upload Error:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Failed to process resume',
      details: error.message 
    });
  }
});

// Get all resumes
app.get('/api/resumes', async (req, res) => {
  try {
    const query = `
      SELECT 
        id, 
        file_name as filename, 
        personal_details->>'name' as name,
        personal_details->>'email' as email,
        ai_feedback->>'rating' as rating,
        created_at
      FROM resumes 
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Get Resumes Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch resumes',
      details: error.message 
    });
  }
});

// Get specific resume details
app.get('/api/resumes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT *
      FROM resumes 
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    const resume = result.rows[0];
    
    res.json({
      id: resume.id,
      filename: resume.file_name,
      created_at: resume.created_at,
      personal_details: resume.personal_details,
      resume_content: resume.resume_content,
      skills: resume.skills,
      ai_feedback: resume.ai_feedback
    });
    
  } catch (error) {
    console.error('Get Resume Details Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch resume details',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
  }
  
  console.error('Unhandled Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    details: error.message 
  });
});

// Start server
const startServer = async () => {
  try {
    await testConnection();
    await initializeTables();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;