
import React from 'react';
import { Lead } from '../types';
import { LeadCard } from './LeadCard';

interface LeadListProps {
  leads: Lead[];
  onReset: () => void;
  isHistoryView?: boolean;
}

export const LeadList: React.FC<LeadListProps> = ({ leads, onReset, isHistoryView = false }) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">
            {isHistoryView ? 'Archived Leads' : 'Your AI-Generated Leads'}
        </h2>
        <p className="mt-2 text-gray-400">
            {isHistoryView ? 'This is a record of a past search.' : 'Here are the potential clients we found for you, complete with personalized emails.'}
        </p>
      </div>

      <div className="space-y-6">
        {leads.slice(0, 5).map((lead, index) => (
          <LeadCard key={index} lead={lead} />
        ))}
        {leads.length > 5 && (
          <div className="space-y-6 lazy-load-container">
            {leads.slice(5).map((lead, index) => (
              <LeadCard key={index + 5} lead={lead} />
            ))}
          </div>
        )}
      </div>
       <div className="text-center pt-6">
        <button
          onClick={onReset}
          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          {isHistoryView ? 'Close History View' : 'Start New Search'}
        </button>
      </div>
    </div>
  );
};
