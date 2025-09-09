import React, { useState, useCallback } from 'react';
import { BusinessInputForm } from './components/BusinessInputForm';
import { LeadList } from './components/LeadList';
import { LoadingScreen } from './components/LoadingScreen';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { AppState, BusinessProfile, Lead, LOADING_MESSAGES } from './types';
import { analyzeBusiness, findLeads, draftOutreach } from './services/geminiService';
import { extractTextFromPDF } from './services/pdfService';

const App: React.FC = () => {
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
      setAppState(AppState.RESULTS);

    } catch (err: any) {
      console.error("Lead generation failed:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
      setAppState(AppState.ERROR);
    }
  }, []);

  const renderContent = () => {
    switch (appState) {
      case AppState.INPUT:
        return <BusinessInputForm onProcess={startLeadGeneration} />;
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
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <main className="container mx-auto px-4 py-8 md:py-16">
        <header className="text-center mb-12">
            <div className="inline-flex items-center justify-center gap-3">
                <SparklesIcon className="w-10 h-10 text-indigo-400" />
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text">
                    AI Lead Finder
                </h1>
            </div>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
                Turn your business description into a list of qualified local leads with AI-drafted outreach emails.
            </p>
        </header>
        <div className="max-w-4xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;