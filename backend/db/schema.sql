-- This schema defines the structure for the 'resumes' table, aligning with the application's data model.
-- It uses JSONB for flexible storage of structured data extracted from resumes.

CREATE TABLE IF NOT EXISTS resumes (
  id SERIAL PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  personal_details JSONB,
  resume_content JSONB,
  skills JSONB,
  ai_feedback JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON resumes(created_at);
CREATE INDEX IF NOT EXISTS idx_resumes_name ON resumes((personal_details->>'name'));
CREATE INDEX IF NOT EXISTS idx_resumes_email ON resumes((personal_details->>'email'));
