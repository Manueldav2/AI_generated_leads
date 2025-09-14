import React, { useState, useCallback, useEffect, useRef } from 'react';
import { BusinessInputForm } from './BusinessInputForm';
import { LeadList } from './LeadList';
import { LoadingScreen } from './LoadingScreen';
import { LeadHistory } from './LeadHistory';
import { AppState, BusinessProfile, Lead, LOADING_MESSAGES, User, SavedBusinessProfile } from '../types';
import { analyzeBusiness, findLeads, draftOutreach } from '../services/geminiService';
import { extractTextFromPDF } from '../services/pdfService';
import { useUser } from '../hooks/useUser';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const navRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!navRef.current) return;
      const scrolled = window.scrollY > 20;
      if (scrolled !== isScrolled) {
        setIsScrolled(scrolled);
        navRef.current.classList.toggle('scrolled', scrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolled]);
  const { userData, saveBusinessProfile, addLeadHistory } = useUser();
  const [appState, setAppState] = useState<AppState>(AppState.INPUT);
  const [loadingMessage, setLoadingMessage] = useState<string>(LOADING_MESSAGES[0]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setAppState(AppState.INPUT);
    setLeads([]);
    setError(null);
    setLoadingMessage(LOADING_MESSAGES[0]);
  };

  const startLeadGeneration = useCallback(async (profile: BusinessProfile) => {
    setAppState(AppState.LOADING);
    setError(null);
    
    // Save the profile settings for next time
    saveBusinessProfile(profile);

    try {
      // Step 1: Handle PDF processing
      let pdfText = '';
      if (profile.pdfFile) {
        setLoadingMessage(LOADING_MESSAGES[0]); // "Analyzing PDF document..."
        pdfText = await extractTextFromPDF(profile.pdfFile);
      }
      
      // Step 2: Analyze the user's business
      setLoadingMessage(LOADING_MESSAGES[1]); // "Understanding your business..."
      const businessSummary = await analyzeBusiness(profile.description, pdfText, profile.url);
      
      // Step 3: Find potential leads
      setLoadingMessage(LOADING_MESSAGES[2]); // "Searching for local leads..."
      const potentialLeads = await findLeads(businessSummary, profile.targetIndustry, profile.location, profile.numberOfLeads);

      if (!potentialLeads || potentialLeads.length === 0) {
        throw new Error("Could not find any suitable leads. Try broadening your search criteria.");
      }
      
      // Step 4: Research each lead and draft outreach emails
      const generatedLeads: Lead[] = [];
      for (let i = 0; i < potentialLeads.length; i++) {
        const lead = potentialLeads[i];
        setLoadingMessage(`${LOADING_MESSAGES[3]} (${i + 1}/${potentialLeads.length}): ${lead.name}`);
        const outreach = await draftOutreach(businessSummary, lead, profile.url, profile.meetingLink, profile.customSnippet);
        generatedLeads.push({ ...lead, ...outreach });
      }
      
      setLeads(generatedLeads);
      addLeadHistory(profile, generatedLeads);
      setAppState(AppState.RESULTS);

    } catch (err: any) {
      console.error("Lead generation failed:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
      setAppState(AppState.ERROR);
    }
  }, [saveBusinessProfile, addLeadHistory]);

  const renderContent = () => {
    switch (appState) {
      case AppState.INPUT:
        return (
          <>
            <BusinessInputForm onProcess={startLeadGeneration} savedProfile={userData.profile} />
            <LeadHistory history={userData.history} />
          </>
        );
      case AppState.LOADING:
        return <LoadingScreen message={loadingMessage} />;
      case AppState.RESULTS:
        return <LeadList leads={leads} onReset={handleReset} />;
      case AppState.ERROR:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">An Error Occurred</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={handleReset}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        );
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="user-info">
          <div className="user-avatar">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="avatar-image" />
            ) : (
              <span className="avatar-placeholder">{user.name[0].toUpperCase()}</span>
            )}
          </div>
          <div className="user-details">
            <span className="user-name">{user.name}</span>
            <span className="user-email">{user.email}</span>
          </div>
        </div>
        <button onClick={onLogout} className="signout-button">
          <span className="signout-icon">↪️</span>
          <span>Sign Out</span>
        </button>
      </div>

      <div className="dashboard-nav-wrapper" ref={navRef}>
        <div className="dashboard-nav">
          <div className="nav-content">
            <div className="nav-section">
              <div className="nav-icon">📊</div>
              <div className="nav-stats">
                <div className="stat-item">
                  <div className="stat-header">
                    <span className="stat-value">{userData.history.length}</span>
                    <span className="stat-trend positive">
                      <span className="trend-arrow">↑</span>
                      <span className="trend-value">+1</span>
                    </span>
                  </div>
                  <span className="stat-label">Total Searches</span>
                  <div className="stat-subtitle">Last search {userData.history[0]?.date ? new Date(userData.history[0].date).toLocaleDateString() : 'Never'}</div>
                </div>
                <div className="stat-item highlight">
                  <div className="stat-header">
                    <span className="stat-value">
                      {leads.length > 0 ? leads.length : (userData.history[0]?.leads.length || 0)}
                    </span>
                    <span className="stat-badge">Active</span>
                  </div>
                  <span className="stat-label">Current Leads</span>
                  <div className="stat-subtitle">Ready to contact</div>
                </div>
                <div className="stat-item">
                  <div className="stat-header">
                    <span className="stat-value">
                      {userData.history.reduce((total, item) => total + item.leads.length, 0)}
                    </span>
                    <span className="stat-trend neutral">
                      <span className="trend-value">All time</span>
                    </span>
                  </div>
                  <span className="stat-label">Total Leads</span>
                  <div className="stat-subtitle">Across all searches</div>
                </div>
              </div>
            </div>
            
            <div className="nav-actions">
              {appState === AppState.RESULTS && (
                <button 
                  onClick={handleReset}
                  className="action-button"
                >
                  <span className="action-icon">🔄</span>
                  New Search
                </button>
              )}
            </div>
          </div>
          
          {appState === AppState.RESULTS && (
            <div className="nav-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${(leads.length / (userData.history[0]?.profile.numberOfLeads || 1)) * 100}%` 
                  }}
                />
              </div>
              <div className="progress-text">
                Generated {leads.length} of {userData.history[0]?.profile.numberOfLeads || 0} requested leads
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-content">
        {appState === AppState.ERROR ? (
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h2 className="error-title">An Error Occurred</h2>
            <p className="error-message">{error}</p>
            <button onClick={handleReset} className="btn btn-primary">
              Try Again
            </button>
          </div>
        ) : (
          <div className="content-container">
            {appState === AppState.LOADING ? (
              <LoadingScreen message={loadingMessage} />
            ) : appState === AppState.RESULTS ? (
              <LeadList leads={leads} onReset={handleReset} />
            ) : (
              <>
                <div className="input-section">
                  <BusinessInputForm 
                    onProcess={startLeadGeneration} 
                    savedProfile={userData.profile} 
                  />
                </div>
                {userData.history.length > 0 && (
                  <div className="history-section">
                    <div className="section-header">
                      <h2 className="section-title">Previous Searches</h2>
                      <p className="section-description">
                        Click on any search to view the generated leads
                      </p>
                    </div>
                    <LeadHistory history={userData.history} />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
};
