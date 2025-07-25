import React from 'react';
import './Navigation.css';

const Navigation = ({ currentView, onNavigate }) => {
  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand" onClick={() => onNavigate('landing')}>
          <div className="brand-icon">🤖</div>
          <span className="brand-text">Resume Analyzer</span>
        </div>
        
        <div className="nav-links">
          <button 
            className={`nav-link ${currentView === 'analyzer' ? 'active' : ''}`}
            onClick={() => onNavigate('analyzer')}
          >
            <span className="nav-icon">📄</span>
            Analyze Resume
          </button>
          
          <button 
            className={`nav-link ${currentView === 'history' ? 'active' : ''}`}
            onClick={() => onNavigate('history')}
          >
            <span className="nav-icon">📊</span>
            History
          </button>
          
          <button 
            className="nav-link"
            onClick={() => onNavigate('landing')}
          >
            <span className="nav-icon">🏠</span>
            Home
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;