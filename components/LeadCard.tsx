
import React, { useState } from 'react';
import { Lead } from '../types';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';

interface LeadCardProps {
  lead: Lead;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead }) => {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState(lead.suggestedEmail || '');
  const [emailError, setEmailError] = useState('');

  const handleCopy = () => {
    const emailContent = `To: ${email || 'Not Found'}\nSubject: ${lead.subject}\n\n${lead.body}`;
    navigator.clipboard.writeText(emailContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const validateEmail = (value: string) => {
    if (!value) {
      return ''; // Allow empty, but the button will be disabled
    }
    // Simple regex for email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Please enter a valid email address.';
    }
    return '';
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setEmailError(validateEmail(newEmail));
  };
  
  const isSendDisabled = !email || !!emailError;
  const uniqueId = `email-${lead.name.replace(/\s+/g, '-')}-${lead.address.slice(0, 5)}`;


  return (
    <div className="lead-card">
      <div className="lead-card-header">
        <div className="lead-info">
          <h3 className="lead-name">{lead.name}</h3>
          <div className="lead-details">
            <span className="lead-address">📍 {lead.address}</span>
            {lead.website && (
              <a 
                href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="lead-website"
              >
                🌐 {lead.website}
              </a>
            )}
          </div>
          <p className="lead-description">{lead.description}</p>
        </div>

        {lead.justification && (
          <div className="lead-insight">
            <div className="insight-header">
              <span className="insight-icon">💡</span>
              <span className="insight-title">Why this lead is a good match</span>
            </div>
            <p className="insight-content">{lead.justification}</p>
          </div>
        )}
      </div>

      <div className="email-section">
        <div className="email-header">
          <h4 className="email-title">
            <span className="email-icon">✉️</span>
            Drafted Email
          </h4>
          <button
            onClick={handleCopy}
            className="copy-button"
            disabled={copied}
            title="Copy email content"
          >
            <ClipboardIcon className="button-icon" />
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
        
        <div className="email-content">
          <div className="email-field">
            <div className="email-input-group">
              <label htmlFor={uniqueId} className="email-label">To:</label>
              <div className="email-input-wrapper">
                <input
                  id={uniqueId}
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="No public email found"
                  className="email-input"
                />
                <a
                  href={!isSendDisabled ? `mailto:${email}?subject=${encodeURIComponent(lead.subject)}&body=${encodeURIComponent(lead.body)}` : undefined}
                  onClick={(e) => isSendDisabled && e.preventDefault()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`send-button ${isSendDisabled ? 'disabled' : ''}`}
                  title={isSendDisabled ? "Enter a valid email to send" : "Open in default email client"}
                >
                  <PaperAirplaneIcon className="button-icon" />
                  <span>Send</span>
                </a>
              </div>
            </div>
            {emailError && <p className="email-error">{emailError}</p>}
          </div>

          <div className="email-subject">
            <span className="email-label">Subject:</span>
            <span className="subject-text">{lead.subject}</span>
          </div>

          <div className="email-body">
            <div className="email-body-content">{lead.body}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
