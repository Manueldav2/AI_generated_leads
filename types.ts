export enum AppState {
  INPUT,
  LOADING,
  RESULTS,
  ERROR,
}

export interface BusinessProfile {
  url: string;
  description: string;
  pdfFile: File | null;
  targetIndustry: string;
  location: string;
  numberOfLeads: number;
  meetingLink?: string;
  customSnippet?: string;
}

// Stripped version for saving, as File object cannot be stringified
export type SavedBusinessProfile = Omit<BusinessProfile, 'pdfFile'>;

export interface PotentialLead {
  name: string;
  description: string;
  address: string;
  website: string;
  email: string;
  justification: string;
}

export interface Outreach {
  subject: string;
  body: string;
  suggestedEmail: string;
}

export type Lead = PotentialLead & Outreach;

export const LOADING_MESSAGES: string[] = [
  "Analyzing document...",
  "Understanding your business...",
  "Searching for local leads...",
  "Drafting outreach emails...",
];

// --- New Types for User Accounts ---

export interface User {
  name: string;
  email: string;
  avatar?: string;
}

export interface LeadHistoryItem {
  id: string; // ISO date string or a unique ID
  date: string;
  profile: SavedBusinessProfile;
  leads: Lead[];
}

export interface UserData {
  profile: SavedBusinessProfile | null;
  history: LeadHistoryItem[];
}
