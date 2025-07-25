import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/DetailsModal.css';  

const DetailsModal = ({ resumeId, onClose }) => {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchResumeDetails();
  }, [resumeId]);

  const fetchResumeDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/resumes/${resumeId}`);
      setResume(response.data);
    } catch (err) {
      console.error('Fetch details error:', err);
      setError('Failed to load resume details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content details-modal">
        <div className="modal-header">
          <h2 className="modal-title">Resume Analysis Details</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="modal-loading">
              <div className="spinner"></div>
              <div className="loading-text">Loading resume details...</div>
            </div>
          ) : error ? (
            <div className="modal-error">
              <div className="alert alert-error">
                {error}
              </div>
              <button className="btn btn-primary" onClick={fetchResumeDetails}>
                Try Again
              </button>
            </div>
          ) : resume ? (
            <div className="details-content">
              {/* Header Info */}
              <div className="details-header">
                <div className="resume-info">
                  <h3 className="resume-name">
                    {resume.personal_details?.name || 'Unknown'}
                  </h3>
                  <div className="resume-meta">
                    <span className="filename">📄 {resume.filename}</span>
                    <span className="analyze-date">
                      🕒 {formatDate(resume.created_at)}
                    </span>
                  </div>
                </div>
                
                <div className="rating-display-modal">
                  <div 
                    className="rating-circle-modal"
                    style={{ borderColor: getRatingColor(resume.ai_feedback?.rating || 0) }}
                  >
                    <span className="rating-number">{resume.ai_feedback?.rating || 0}</span>
                    <span className="rating-total">/10</span>
                  </div>
                  <div 
                    className="rating-label-modal"
                    style={{ color: getRatingColor(resume.ai_feedback?.rating || 0) }}
                  >
                    {getRatingLabel(resume.ai_feedback?.rating || 0)}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="details-grid">
                {/* Personal Details */}
                <div className="detail-section">
                  <h4 className="section-title">👤 Personal Information</h4>
                  <div className="detail-content">
                    {resume.personal_details ? (
                      <div className="personal-details-modal">
                        {resume.personal_details.name && (
                          <div className="detail-item">
                            <span className="detail-label">Name:</span>
                            <span className="detail-value">{resume.personal_details.name}</span>
                          </div>
                        )}
                        {resume.personal_details.email && (
                          <div className="detail-item">
                            <span className="detail-label">Email:</span>
                            <span className="detail-value">{resume.personal_details.email}</span>
                          </div>
                        )}
                        {resume.personal_details.phone && (
                          <div className="detail-item">
                            <span className="detail-label">Phone:</span>
                            <span className="detail-value">{resume.personal_details.phone}</span>
                          </div>
                        )}
                        {resume.personal_details.linkedin && (
                          <div className="detail-item">
                            <span className="detail-label">LinkedIn:</span>
                            <span className="detail-value">
                              <a href={resume.personal_details.linkedin} target="_blank" rel="noopener noreferrer">
                                {resume.personal_details.linkedin}
                              </a>
                            </span>
                          </div>
                        )}
                        {resume.personal_details.location && (
                          <div className="detail-item">
                            <span className="detail-label">Location:</span>
                            <span className="detail-value">{resume.personal_details.location}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="no-data">No personal details available</div>
                    )}
                  </div>
                </div>

                {/* Skills */}
                <div className="detail-section">
                  <h4 className="section-title">🛠️ Skills Analysis</h4>
                  <div className="detail-content">
                    {resume.skills ? (
                      <div className="skills-modal">
                        {resume.skills.technical_skills && resume.skills.technical_skills.length > 0 && (
                          <div className="skill-category-modal">
                            <h5>Technical Skills</h5>
                            <div className="skills-list-modal">
                              {resume.skills.technical_skills.map((skill, index) => (
                                <span key={index} className="skill-tag technical">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {resume.skills.soft_skills && resume.skills.soft_skills.length > 0 && (
                          <div className="skill-category-modal">
                            <h5>Soft Skills</h5>
                            <div className="skills-list-modal">
                              {resume.skills.soft_skills.map((skill, index) => (
                                <span key={index} className="skill-tag soft">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="no-data">No skills data available</div>
                    )}
                  </div>
                </div>

                {/* Work Experience */}
                {resume.resume_content?.work_experience && resume.resume_content.work_experience.length > 0 && (
                  <div className="detail-section full-width">
                    <h4 className="section-title">💼 Work Experience</h4>
                    <div className="detail-content">
                      <div className="experience-list-modal">
                        {resume.resume_content.work_experience.map((exp, index) => (
                          <div key={index} className="experience-item-modal">
                            <div className="exp-header-modal">
                              <h5>{exp.position}</h5>
                              <span className="company-modal">{exp.company}</span>
                            </div>
                            <div className="exp-duration-modal">{exp.duration}</div>
                            {exp.responsibilities && exp.responsibilities.length > 0 && (
                              <ul className="responsibilities-modal">
                                {exp.responsibilities.map((resp, idx) => (
                                  <li key={idx}>{resp}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Education */}
                {resume.resume_content?.education && resume.resume_content.education.length > 0 && (
                  <div className="detail-section">
                    <h4 className="section-title">🎓 Education</h4>
                    <div className="detail-content">
                      <div className="education-list-modal">
                        {resume.resume_content.education.map((edu, index) => (
                          <div key={index} className="education-item-modal">
                            <h5>{edu.degree}</h5>
                            <div className="institution">{edu.institution}</div>
                            <div className="edu-details">
                              {edu.year && <span>Year: {edu.year}</span>}
                              {edu.gpa && <span>GPA: {edu.gpa}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Projects */}
                {resume.resume_content?.projects && resume.resume_content.projects.length > 0 && (
                  <div className="detail-section">
                    <h4 className="section-title">🚀 Projects</h4>
                    <div className="detail-content">
                      <div className="projects-list-modal">
                        {resume.resume_content.projects.map((project, index) => (
                          <div key={index} className="project-item-modal">
                            <h5>{project.name}</h5>
                            <p className="project-description">{project.description}</p>
                            {project.technologies && project.technologies.length > 0 && (
                              <div className="project-tech">
                                <strong>Technologies:</strong>
                                <div className="tech-tags">
                                  {project.technologies.map((tech, idx) => (
                                    <span key={idx} className="tech-tag">
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {resume.resume_content?.certifications && resume.resume_content.certifications.length > 0 && (
                  <div className="detail-section">
                    <h4 className="section-title">🏆 Certifications</h4>
                    <div className="detail-content">
                      <div className="certifications-list-modal">
                        {resume.resume_content.certifications.map((cert, index) => (
                          <div key={index} className="certification-item-modal">
                            <h5>{cert.name}</h5>
                            <div className="cert-details">
                              <span className="issuer">{cert.issuer}</span>
                              {cert.date && <span className="cert-date">{cert.date}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Feedback */}
                <div className="detail-section full-width feedback-section-modal">
                  <h4 className="section-title">🤖 AI Feedback & Recommendations</h4>
                  <div className="detail-content">
                    {resume.ai_feedback ? (
                      <div className="feedback-content-modal">
                        {resume.ai_feedback.rating_explanation && (
                          <div className="feedback-subsection">
                            <h5>📊 Rating Explanation</h5>
                            <p className="explanation-text">{resume.ai_feedback.rating_explanation}</p>
                          </div>
                        )}

                        {resume.ai_feedback.strengths && resume.ai_feedback.strengths.length > 0 && (
                          <div className="feedback-subsection">
                            <h5>✅ Strengths</h5>
                            <ul className="feedback-list strengths-modal">
                              {resume.ai_feedback.strengths.map((strength, index) => (
                                <li key={index}>{strength}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {resume.ai_feedback.improvement_areas && resume.ai_feedback.improvement_areas.length > 0 && (
                          <div className="feedback-subsection">
                            <h5>🔧 Areas for Improvement</h5>
                            <ul className="feedback-list improvements-modal">
                              {resume.ai_feedback.improvement_areas.map((area, index) => (
                                <li key={index}>{area}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {resume.ai_feedback.suggested_skills && resume.ai_feedback.suggested_skills.length > 0 && (
                          <div className="feedback-subsection">
                            <h5>🚀 Recommended Skills to Learn</h5>
                            <div className="suggested-skills-modal">
                              {resume.ai_feedback.suggested_skills.map((skill, index) => (
                                <span key={index} className="suggested-skill-modal">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="no-data">No AI feedback available</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailsModal;