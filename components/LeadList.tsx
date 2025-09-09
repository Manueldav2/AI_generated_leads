
import React from 'react';
import { Lead } from '../types';
import { LeadCard } from './LeadCard';

interface LeadListProps {
  leads: Lead[];
  onReset: () => void;
}

export const LeadList: React.FC<LeadListProps> = ({ leads, onReset }) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Your AI-Generated Leads</h2>
        <p className="mt-2 text-gray-400">Here are the potential clients we found for you, complete with personalized emails.</p>
      </div>

      <div className="space-y-6">
        {leads.map((lead, index) => (
          <LeadCard key={index} lead={lead} />
        ))}
      </div>
       <div className="text-center pt-6">
        <button
          onClick={onReset}
          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          Start New Search
        </button>
      </div>
    </div>
  );
};
