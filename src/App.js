import React, { useState } from 'react';
import Landing from './components/LandingPage';
import Navigation from './components/Navigation';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import HistoryViewer from './components/HistoryViewer';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('landing');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return <Landing onNavigate={setCurrentView} />;
      case 'analyzer':
        return <ResumeAnalyzer />;
      case 'history':
        return <HistoryViewer />;
      default:
        return <Landing onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="App">
      {currentView !== 'landing' && (
        <Navigation currentView={currentView} onNavigate={setCurrentView} />
      )}
      {renderCurrentView()}
    </div>
  );
}

export default App;