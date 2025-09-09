import React, { useState, FormEvent, useEffect } from 'react';
import { BusinessProfile } from '../types';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';

interface BusinessInputFormProps {
  onProcess: (profile: BusinessProfile) => void;
}

export const BusinessInputForm: React.FC<BusinessInputFormProps> = ({ onProcess }) => {
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [targetIndustry, setTargetIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [numberOfLeads, setNumberOfLeads] = useState(5);
  const [meetingLink, setMeetingLink] = useState('');
  const [customSnippet, setCustomSnippet] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setIsGettingLocation(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // A simple reverse geocoding approach using a free public API
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
          if(!response.ok) throw new Error("Failed to fetch location data");
          const data = await response.json();
          const city = data.address.city || data.address.town || data.address.village;
          const state = data.address.state;
          if (city && state) {
            setLocation(`${city}, ${state}`);
          } else {
             setLocationError("Could not determine city and state from your location.");
          }
        } catch (error) {
           setLocationError("Failed to reverse geocode your location.");
        } finally {
           setIsGettingLocation(false);
        }
      },
      () => {
        setLocationError("Unable to retrieve your location. Please grant permission or enter it manually.");
        setIsGettingLocation(false);
      }
    );
  };


  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (description && targetIndustry && location) {
      onProcess({ url, description, pdfFile, targetIndustry, location, numberOfLeads, meetingLink, customSnippet });
    } else {
      alert("Please fill in the description, target industry, and location.");
    }
  };

  return (
    <div className="bg-gray-800/50 p-6 md:p-8 rounded-2xl border border-gray-700 shadow-xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
            Describe your business and services
          </label>
          <textarea
            id="description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
            placeholder="e.g., We are a digital marketing agency specializing in building websites for local restaurants."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-2">
                Your Business Website (Optional)
              </label>
              <input
                type="text"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
                placeholder="yourbusiness.com"
              />
            </div>
             <div>
                <label htmlFor="meetingLink" className="block text-sm font-medium text-gray-300 mb-2">
                    Meeting Link (e.g., Calendly, Optional)
                </label>
                <input
                    type="text"
                    id="meetingLink"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
                    placeholder="calendly.com/your-name"
                />
            </div>
        </div>

        <div>
            <label htmlFor="customSnippet" className="block text-sm font-medium text-gray-300 mb-2">
                Feature to Highlight in Email (Optional)
            </label>
            <textarea
                id="customSnippet"
                rows={3}
                value={customSnippet}
                onChange={(e) => setCustomSnippet(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
                placeholder="e.g., Mention that we've already created a preliminary design mockup for them."
            />
        </div>
        
        <div>
            <label htmlFor="pdfFile" className="block text-sm font-medium text-gray-300 mb-2">
                Upload Business Info (PDF, Optional)
            </label>
            <input
                type="file"
                id="pdfFile"
                onChange={handleFileChange}
                accept=".pdf"
                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
            />
        </div>

        <div className="border-t border-gray-700 pt-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-200">Who are you looking for?</h3>
              <p className="text-sm text-gray-400 mb-4">Specify the type of business and location you want to target.</p>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label htmlFor="targetIndustry" className="block text-sm font-medium text-gray-300 mb-2">
                        Target Industry
                    </label>
                    <input
                        type="text"
                        id="targetIndustry"
                        value={targetIndustry}
                        onChange={(e) => setTargetIndustry(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
                        placeholder="e.g., Restaurants, Plumbers, Cafes"
                        required
                    />
                 </div>
                 <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
                        Location (City, State)
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
                            placeholder="e.g., San Francisco, CA"
                            required
                        />
                         <button type="button" onClick={handleGetLocation} disabled={isGettingLocation} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            {isGettingLocation ? '...' : 'Auto'}
                        </button>
                    </div>
                    {locationError ? (
                        <p className="text-red-400 text-xs mt-2">{locationError}</p>
                    ) : (
                        <p className="text-gray-500 text-xs mt-2">Click 'Auto' to use your current location (requires browser permission).</p>
                    )}
                 </div>
             </div>
             <div>
                <label htmlFor="numberOfLeads" className="block text-sm font-medium text-gray-300 mb-2">
                    Number of Leads: <span className="font-bold text-indigo-400">{numberOfLeads}</span>
                </label>
                <input
                    type="range"
                    id="numberOfLeads"
                    min="1"
                    max="10"
                    value={numberOfLeads}
                    onChange={(e) => setNumberOfLeads(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <p className="text-gray-500 text-xs mt-2">Requesting more leads will broaden the search area around your chosen location.</p>
            </div>
        </div>


        <div className="text-center pt-4">
          <button
            type="submit"
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 shadow-lg"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
            Find Leads
          </button>
        </div>
      </form>
    </div>
  );
};