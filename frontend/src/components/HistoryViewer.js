import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DetailsModal from './DetailsModal';
import '../styles/HistoryViewer.css';

const HistoryViewer = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/resumes`);
      setResumes(response.data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load resume history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortedAndFilteredResumes = () => {
    let filtered = resumes.filter(resume => 
      (resume.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (resume.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (resume.filename?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle date sorting
      if (sortBy === 'created_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Handle rating sorting (convert to number)
      if (sortBy === 'rating') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }

      // Handle string sorting
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRatingColor = (rating) => {
    const numRating = parseFloat(rating) || 0;
    if (numRating >= 8) return '#48bb78';
    if (numRating >= 6) return '#ed8936';
    return '#f56565';
  };

  const getRatingLabel = (rating) => {
    const numRating = parseFloat(rating) || 0;
    if (numRating >= 8) return 'Excellent';
    if (numRating >= 6) return 'Good';
    if (numRating >= 4) return 'Fair';
    return 'Needs Improvement';
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const sortedResumes = getSortedAndFilteredResumes();

  return (
    <div className="history-container">
      <div className="history-content">
        <div className="history-header">
          <h1 className="history-title">Resume Analysis History</h1>
          <p className="history-subtitle">
            View and manage all your previously analyzed resumes
          </p>
        </div>

        <div className="history-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name, email, or filename..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <div className="search-icon">🔍</div>
          </div>

          <div className="stats-summary">
            <div className="stat-item">
              <span className="stat-number">{resumes.length}</span>
              <span className="stat-label">Total Analyzed</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {resumes.filter(r => parseFloat(r.rating) >= 8).length}
              </span>
              <span className="stat-label">Excellent Ratings</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {Math.round(resumes.reduce((acc, r) => acc + (parseFloat(r.rating) || 0), 0) / resumes.length) || 0}
              </span>
              <span className="stat-label">Average Rating</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-section">
            <div className="spinner"></div>
            <div className="loading-text">Loading resume history...</div>
          </div>
        ) : error ? (
          <div className="error-section">
            <div className="alert alert-error">
              {error}
            </div>
            <button className="btn btn-primary" onClick={fetchResumes}>
              Try Again
            </button>
          </div>
        ) : sortedResumes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No Resumes Found</h3>
            <p>
              {resumes.length === 0 
                ? "You haven't analyzed any resumes yet. Upload your first resume to get started!"
                : "No resumes match your search criteria. Try adjusting your search terms."
              }
            </p>
          </div>
        ) : (
          <div className="history-table-container">
            <div className="table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th 
                      className="sortable"
                      onClick={() => handleSort('name')}
                    >
                      Name {getSortIcon('name')}
                    </th>
                    <th 
                      className="sortable"
                      onClick={() => handleSort('email')}
                    >
                      Email {getSortIcon('email')}
                    </th>
                    <th 
                      className="sortable"
                      onClick={() => handleSort('filename')}
                    >
                      Filename {getSortIcon('filename')}
                    </th>
                    <th 
                      className="sortable"
                      onClick={() => handleSort('rating')}
                    >
                      Rating {getSortIcon('rating')}
                    </th>
                    <th 
                      className="sortable"
                      onClick={() => handleSort('created_at')}
                    >
                      Analyzed On {getSortIcon('created_at')}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedResumes.map((resume) => (
                    <tr key={resume.id} className="table-row">
                      <td className="name-cell">
                        <div className="user-info">
                          <div className="user-avatar">
                            {resume.name ? resume.name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <span className="user-name">
                            {resume.name || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="email-cell">
                        {resume.email || 'Not provided'}
                      </td>
                      <td className="filename-cell">
                        <div className="filename-info">
                          <span className="file-icon">📄</span>
                          <span className="filename" title={resume.filename}>
                            {resume.filename.length > 30 
                              ? `${resume.filename.substring(0, 30)}...` 
                              : resume.filename
                            }
                          </span>
                        </div>
                      </td>
                      <td className="rating-cell">
                        <div className="rating-badge">
                          <span 
                            className="rating-number"
                            style={{ color: getRatingColor(resume.rating) }}
                          >
                            {resume.rating || 'N/A'}
                          </span>
                          <span className="rating-label">
                            {getRatingLabel(resume.rating)}
                          </span>
                        </div>
                      </td>
                      <td className="date-cell">
                        {formatDate(resume.created_at)}
                      </td>
                      <td className="actions-cell">
                        <button
                          className="btn btn-primary btn-small"
                          onClick={() => setSelectedResumeId(resume.id)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              <div className="results-count">
                Showing {sortedResumes.length} of {resumes.length} resumes
              </div>
            </div>
          </div>
        )}

        {selectedResumeId && (
          <DetailsModal
            resumeId={selectedResumeId}
            onClose={() => setSelectedResumeId(null)}
          />
        )}
      </div>
    </div>
  );
};

export default HistoryViewer;