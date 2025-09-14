import React, { useState, FormEvent, useEffect } from 'react';
import { BusinessProfile, SavedBusinessProfile } from '../types';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';

interface BusinessInputFormProps {
  onProcess: (profile: BusinessProfile) => void;
  savedProfile: SavedBusinessProfile | null;
}

export const BusinessInputForm: React.FC<BusinessInputFormProps> = ({ onProcess, savedProfile }) => {
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

  useEffect(() => {
    if (savedProfile) {
      setUrl(savedProfile.url);
      setDescription(savedProfile.description);
      setTargetIndustry(savedProfile.targetIndustry);
      setLocation(savedProfile.location);
      setNumberOfLeads(savedProfile.numberOfLeads);
      setMeetingLink(savedProfile.meetingLink || '');
      setCustomSnippet(savedProfile.customSnippet || '');
    }
  }, [savedProfile]);


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
    <div className="card fade-in">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="form-group">
          <label htmlFor="description">
            Describe your business and services
          </label>
          <textarea
            id="description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., We are a digital marketing agency specializing in building websites for local restaurants."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label htmlFor="url">
                Your Business Website (Optional)
              </label>
              <input
                type="text"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="yourbusiness.com"
              />
            </div>
            <div className="form-group">
              <label htmlFor="meetingLink">
                Meeting Link (e.g., Calendly, Optional)
              </label>
              <input
                type="text"
                id="meetingLink"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="calendly.com/your-name"
              />
            </div>
        </div>

        <div className="form-group">
          <label htmlFor="customSnippet">
            Feature to Highlight in Email (Optional)
          </label>
          <textarea
            id="customSnippet"
            rows={3}
            value={customSnippet}
            onChange={(e) => setCustomSnippet(e.target.value)}
            placeholder="e.g., Mention that we've already created a preliminary design mockup for them."
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="pdfFile">
            Upload Business Info (PDF, Optional)
          </label>
          <input
            type="file"
            id="pdfFile"
            onChange={handleFileChange}
            accept=".pdf"
            className="file-input"
          />
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="mb-6">
            <h3 className="text-gradient text-xl font-bold mb-2">Who are you looking for?</h3>
            <p className="text-text-secondary">Specify the type of business and location you want to target.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label htmlFor="targetIndustry">
                Target Industry
              </label>
              <input
                type="text"
                id="targetIndustry"
                value={targetIndustry}
                onChange={(e) => setTargetIndustry(e.target.value)}
                placeholder="e.g., Restaurants, Plumbers, Cafes"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="location">
                Location (City, State)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., San Francisco, CA"
                  required
                />
                <button 
                  type="button" 
                  onClick={handleGetLocation} 
                  disabled={isGettingLocation}
                  className="btn btn-outline"
                >
                  {isGettingLocation ? '...' : 'Auto'}
                </button>
              </div>
              {locationError ? (
                <p className="text-error text-sm mt-2">{locationError}</p>
              ) : (
                <p className="text-text-secondary text-sm mt-2">Click 'Auto' to use your current location (requires browser permission).</p>
              )}
            </div>
          </div>
          
          <div className="form-group mt-6">
            <label htmlFor="numberOfLeads">
              Number of Leads: <span className="text-gradient font-bold">{numberOfLeads}</span>
            </label>
            <input
              type="range"
              id="numberOfLeads"
              min="1"
              max="10"
              value={numberOfLeads}
              onChange={(e) => setNumberOfLeads(Number(e.target.value))}
              className="slider"
            />
            <p className="text-text-secondary text-sm mt-2">Requesting more leads will broaden the search area around your chosen location.</p>
          </div>
        </div>

        <div className="text-center mt-8">
          <button
            type="submit"
            className="btn btn-primary"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
            Find Leads
          </button>
        </div>
      </form>
    </div>
  );
};
