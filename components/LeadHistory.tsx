import React, { useState } from 'react';
import { LeadHistoryItem } from '../types';
import { LeadList } from './LeadList';

interface LeadHistoryProps {
  history: LeadHistoryItem[];
}

const HistoryItem: React.FC<{ item: LeadHistoryItem }> = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`history-item glass-card ${isOpen ? 'open' : ''}`}>
      <div className="history-item-preview" onClick={() => setIsOpen(!isOpen)}>
        <div className="history-item-header">
          <div className="history-item-stats">
            <div className="history-badge">
              <span className="badge-icon">🎯</span>
              <span className="badge-text">{item.profile.numberOfLeads} Leads</span>
            </div>
            <div className="history-badge">
              <span className="badge-icon">📅</span>
              <span className="badge-text">{item.date}</span>
            </div>
          </div>
          <div className="history-expand-icon">
            <svg
              viewBox="0 0 24 24"
              stroke="currentColor"
              fill="none"
              width="24"
              height="24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        
        <div className="history-item-main">
          <h3 className="history-title">{item.profile.targetIndustry}</h3>
          <div className="history-details">
            <div className="history-detail">
              <span className="detail-icon">📍</span>
              <span className="detail-text">{item.profile.location}</span>
            </div>
            {item.profile.customSnippet && (
              <div className="history-detail">
                <span className="detail-icon">💡</span>
                <span className="detail-text">{item.profile.customSnippet}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`history-item-content ${isOpen ? 'visible' : ''}`}>
        <div className="history-divider">
          <span className="divider-text">Generated Leads</span>
        </div>
        <LeadList 
          leads={item.leads} 
          onReset={() => setIsOpen(false)} 
          isHistoryView={true} 
        />
      </div>
    </div>
  );
};


export const LeadHistory: React.FC<LeadHistoryProps> = ({ history }) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="history-container">
      <div className="history-list">
        {history.map((item, index) => (
          <HistoryItem 
            key={`${item.date}-${index}`} 
            item={{
              ...item,
              date: new Date(item.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            }} 
          />
        ))}
      </div>
    </div>
  );
};
