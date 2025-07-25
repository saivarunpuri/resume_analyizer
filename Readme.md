<!--
This README provides a high-level overview of the Resume Analyzer backend project,
including its purpose, technologies used, setup instructions, and API endpoints.
-->

# Resume Analyzer Backend

## Overview

The Resume Analyzer backend is a Node.js application built with Express.js that provides API endpoints for uploading, storing, and analyzing resumes. It uses the Gemini AI to extract information and provide feedback on the resume.

## Technologies Used

*   Node.js
*   Express.js
*   Multer (for handling file uploads)
*   PostgreSQL (as the database)
*   Gemini AI (for resume analysis)

## Setup Instructions

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd backend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure the database:**

    *   Set up a PostgreSQL database.
    *   Update the database connection details in the `db.js` file.

4.  **Set up environment variables:**

    *   Create a `.env` file in the root directory.
    *   Add any necessary environment variables (e.g., Gemini API key).

5.  **Run the application:**

    ```bash
    npm start
    ```

## API Endpoints

*   `POST /upload`: Upload a resume file for analysis.

    *   Request body: `multipart/form-data` with a file named `resume`.
    *   Response: JSON object with a success message and the ID of the uploaded resume.

*   `GET /`: Get all resumes (historical view).

    *   Response: JSON array of resume objects.

*   `GET /:id`: Get a specific resume by ID.

    *   Response: JSON object with the resume data.

## Controllers
*   `resumeController.js`:
    *   `uploadResume`: Handles resume uploads, text extraction, data analysis with Gemini AI, and database insertion.
    *   `getAllResumes`: Retrieves all resumes from the database for a historical view.
    *   `getResumeById`: Retrieves a specific resume from the database by ID.

## Services
*   `analysisService.js`:
    *   `extractTextFromPdf`: Extracts text from a PDF file.
    *   `analyzeResumeWithGemini`: Analyzes the resume with Gemini AI.

## Database
*   The database schema includes a `resumes` table with columns for file name, upload date, contact information, summary, work experience, education, skills, projects, certifications, resume rating, and improvement areas.

## Error Handling

*   The application includes error handling for file uploads, text extraction, Gemini AI analysis, and database operations.
*   Error messages are returned in the response body with appropriate HTTP status codes.

## Contributing

*   Contributions are welcome! Please submit a pull request with your changes.

## License

*   [MIT](LICENSE)
