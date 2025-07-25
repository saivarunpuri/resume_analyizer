import React, { useState, useRef } from 'react';
import axios from 'axios';
import '../styles/ResumeAnalyzer.css';

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Handle file drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setError('');
      } else {
        setError('Please upload a PDF file only.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please upload a PDF file only.');
      }
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setLoading(true);
    setError('');
    setProgress(0);
    setAnalysis(null);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => prev < 90 ? prev + 10 : prev);
      }, 500);

      const response = await axios.post(`${API_BASE_URL}/api/resumes/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds timeout
      });

      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        setAnalysis(response.data);
        setLoading(false);
        setProgress(0);
      }, 500);

    } catch (err) {
      setLoading(false);
      setProgress(0);
      console.error('Analysis error:', err);
      
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timeout. Please try again with a smaller file.');
      } else {
        setError('Failed to analyze resume. Please try again.');
      }
    }
  };

  const handleReset = () => {
    setFile(null);
    setAnalysis(null);
    setError('');
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 8) return '#48bb78';
    if (rating >= 6) return '#ed8936';
    return '#f56565';
  };

  const getRatingLabel = (rating) => {
    if (rating >= 8) return 'Excellent';
    if (rating >= 6) return 'Good';
    if (rating >= 4) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="analyzer-container">
      <div className="analyzer-content">
        <div className="analyzer-header">
          <h1 className="analyzer-title">Resume Analysis</h1>
          <p className="analyzer-subtitle">
            Upload your resume and get AI-powered insights to improve your career prospects
          </p>
        </div>

        {!analysis ? (
          <div className="upload-section">
            <div 
              className={`upload-area ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              
              {!file ? (
                <div className="upload-placeholder">
                  <div className="upload-icon">📄</div>
                  <h3>Drop your resume here</h3>
                  <p>or click to browse files</p>
                  <div className="upload-note">PDF files only, max 5MB</div>
                </div>
              ) : (
                <div className="file-selected">
                  <div className="file-icon">📋</div>
                  <div className="file-info">
                    <div className="file-name">{file.name}</div>
                    <div className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                  <button className="remove-file" onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}>
                    ✕
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            {loading && (
              <div className="loading-section">
                <div className="spinner"></div>
                <div className="loading-text">Analyzing your resume...</div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="progress-text">{progress}% Complete</div>
              </div>
            )}

            <div className="action-buttons">
              <button 
                className="btn btn-primary btn-large"
                onClick={handleAnalyze}
                disabled={!file || loading}
              >
                {loading ? 'Analyzing...' : 'Analyze Resume'}
              </button>
              
              {file && (
                <button 
                  className="btn btn-secondary"
                  onClick={handleReset}
                  disabled={loading}
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="results-section">
            <div className="results-header">
              <h2>Analysis Results</h2>
              <button className="btn btn-secondary" onClick={handleReset}>
                Analyze Another Resume
              </button>
            </div>

            <div className="results-grid">
              {/* Personal Details */}
              <div className="result-card">
                <h3 className="card-title">Personal Information</h3>
                <div className="personal-details">
                  {analysis.personal_details?.name && (
                    <div className="detail-item">
                      <span className="detail-label">Name:</span>
                      <span className="detail-value">{analysis.personal_details.name}</span>
                    </div>
                  )}
                  {analysis.personal_details?.email && (
                    <div className="detail-item">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{analysis.personal_details.email}</span>
                    </div>
                  )}
                  {analysis.personal_details?.phone && (
                    <div className="detail-item">
                      <span className="detail-label">Phone:</span>
                      <span className="detail-value">{analysis.personal_details.phone}</span>
                    </div>
                  )}
                  {analysis.personal_details?.linkedin && (
                    <div className="detail-item">
                      <span className="detail-label">LinkedIn:</span>
                      <span className="detail-value">
                        <a href={analysis.personal_details.linkedin} target="_blank" rel="noopener noreferrer">
                          {analysis.personal_details.linkedin}
                        </a>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Rating */}
              <div className="result-card rating-card">
                <h3 className="card-title">AI Rating</h3>
                <div className="rating-display">
                  <div 
                    className="rating-circle"
                    style={{ borderColor: getRatingColor(analysis.ai_feedback?.rating || 0) }}
                  >
                    <span className="rating-number">{analysis.ai_feedback?.rating || 0}</span>
                    <span className="rating-total">/10</span>
                  </div>
                  <div className="rating-info">
                    <div 
                      className="rating-label"
                      style={{ color: getRatingColor(analysis.ai_feedback?.rating || 0) }}
                    >
                      {getRatingLabel(analysis.ai_feedback?.rating || 0)}
                    </div>
                    {analysis.ai_feedback?.rating_explanation && (
                      <div className="rating-explanation">
                        {analysis.ai_feedback.rating_explanation}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="result-card">
                <h3 className="card-title">Skills Analysis</h3>
                <div className="skills-section">
                  {analysis.skills?.technical_skills && analysis.skills.technical_skills.length > 0 && (
                    <div className="skill-category">
                      <h4>Technical Skills</h4>
                      <div className="skills-list">
                        {analysis.skills.technical_skills.map((skill, index) => (
                          <span key={index} className="skill-tag technical">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {analysis.skills?.soft_skills && analysis.skills.soft_skills.length > 0 && (
                    <div className="skill-category">
                      <h4>Soft Skills</h4>
                      <div className="skills-list">
                        {analysis.skills.soft_skills.map((skill, index) => (
                          <span key={index} className="skill-tag soft">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Work Experience */}
              {analysis.resume_content?.work_experience && analysis.resume_content.work_experience.length > 0 && (
                <div className="result-card">
                  <h3 className="card-title">Work Experience</h3>
                  <div className="experience-list">
                    {analysis.resume_content.work_experience.map((exp, index) => (
                      <div key={index} className="experience-item">
                        <div className="exp-header">
                          <h4>{exp.position}</h4>
                          <span className="company">{exp.company}</span>
                        </div>
                        <div className="exp-duration">{exp.duration}</div>
                        {exp.responsibilities && exp.responsibilities.length > 0 && (
                          <ul className="responsibilities">
                            {exp.responsibilities.map((resp, idx) => (
                              <li key={idx}>{resp}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Feedback */}
              <div className="result-card feedback-card">
                <h3 className="card-title">AI Feedback & Recommendations</h3>
                
                {analysis.ai_feedback?.strengths && analysis.ai_feedback.strengths.length > 0 && (
                  <div className="feedback-section">
                    <h4 className="feedback-subtitle">✅ Strengths</h4>
                    <ul className="feedback-list strengths">
                      {analysis.ai_feedback.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.ai_feedback?.improvement_areas && analysis.ai_feedback.improvement_areas.length > 0 && (
                  <div className="feedback-section">
                    <h4 className="feedback-subtitle">🔧 Areas for Improvement</h4>
                    <ul className="feedback-list improvements">
                      {analysis.ai_feedback.improvement_areas.map((area, index) => (
                        <li key={index}>{area}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.ai_feedback?.suggested_skills && analysis.ai_feedback.suggested_skills.length > 0 && (
                  <div className="feedback-section">
                    <h4 className="feedback-subtitle">🚀 Recommended Skills to Learn</h4>
                    <div className="suggested-skills">
                      {analysis.ai_feedback.suggested_skills.map((skill, index) => (
                        <span key={index} className="suggested-skill">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzer;