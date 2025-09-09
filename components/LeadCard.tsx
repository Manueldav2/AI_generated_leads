import React, { useState } from 'react';
import { Lead } from '../types';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';

interface LeadCardProps {
  lead: Lead;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const emailContent = `To: ${lead.suggestedEmail}\nSubject: ${lead.subject}\n\n${lead.body}`;
    navigator.clipboard.writeText(emailContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg overflow-hidden transition-all hover:border-indigo-500/50">
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
          <div>
            <h3 className="text-xl font-bold text-white">{lead.name}</h3>
            <p className="text-sm text-gray-400 mt-1">{lead.address}</p>
            {lead.website && (
              <a 
                href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors block mt-1 break-all"
              >
                {lead.website}
              </a>
            )}
            <p className="text-gray-300 mt-2 text-base">{lead.description}</p>

            {lead.justification && (
              <div className="mt-4 p-3 bg-gray-700/40 rounded-md border border-gray-600">
                <p className="text-sm font-semibold text-gray-300">
                  <span className="text-indigo-400">AI Insight:</span> Why this lead is a good match
                </p>
                <p className="text-gray-400 mt-1 text-sm italic">{lead.justification}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-gray-900/70 p-4 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-gray-200">Drafted Email</h4>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 text-sm bg-gray-600 hover:bg-gray-700 text-white font-semibold py-1 px-3 rounded-md transition-colors disabled:opacity-50"
                        disabled={copied}
                        title="Copy email content"
                    >
                        <ClipboardIcon className="w-4 h-4" />
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                     <a
                        href={`mailto:${lead.suggestedEmail}?subject=${encodeURIComponent(lead.subject)}&body=${encodeURIComponent(lead.body)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1 px-3 rounded-md transition-colors"
                        title="Open in default email client"
                    >
                        <PaperAirplaneIcon className="w-4 h-4" />
                        Send
                    </a>
                </div>
            </div>
            
            <div className="text-sm space-y-3">
                <p><strong className="text-gray-400">To:</strong> <span className="text-cyan-400">{lead.suggestedEmail}</span></p>
                <p><strong className="text-gray-400">Subject:</strong> {lead.subject}</p>
                <div className="border-t border-gray-600 my-2"></div>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{lead.body}</p>
            </div>
        </div>
      </div>
    </div>
  );
};