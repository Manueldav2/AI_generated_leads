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