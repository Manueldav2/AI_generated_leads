import React from 'react';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { useUser } from './hooks/useUser';

const App: React.FC = () => {
  const { user, login, logout } = useUser();

  return (
    <div className="app-container">
      <div className="hero-section">
        <div className="logo-container">
          <div className="logo-glow"></div>
          <SparklesIcon className="logo-icon" width={48} height={48} />
        </div>
        <h1 className="app-title">
          AI Lead Finder
          <span className="title-accent">✨</span>
        </h1>
        <p className="app-description">
          Transform your business outreach with AI-powered lead generation.
          <br />
          <span className="text-gradient">Discover, Connect, and Grow</span> with qualified local leads.
        </p>
        {!user && (
          <div className="hero-features">
            <div className="feature-card">
              <span className="feature-icon">🎯</span>
              <h3>Smart Targeting</h3>
              <p>AI-driven lead matching based on your business profile</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">✍️</span>
              <h3>Auto-Generated Emails</h3>
              <p>Personalized outreach messages crafted by AI</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📊</span>
              <h3>Lead Analytics</h3>
              <p>Track and manage your lead generation history</p>
            </div>
          </div>
        )}
      </div>
      <div className="content-container glass-card">
        {user ? <Dashboard user={user} onLogout={logout} /> : <Auth onLogin={login} />}
      </div>
      <footer className="app-footer">
        <p>Powered by AI • Built with Modern Technology • Designed for Growth</p>
      </footer>
    </div>
  );
};

export default App;
