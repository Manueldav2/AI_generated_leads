import { createClient } from '@supabase/supabase-js';
import { User, BusinessProfile, Lead, SavedBusinessProfile, LeadHistoryItem } from '../types';

// Get these from your Supabase project settings
// For development, we'll hardcode these values temporarily
const supabaseUrl = 'https://feopkacqptqcctbffwlg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlb3BrYWNxcHRxY2N0YmZmd2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MDQ5MDgsImV4cCI6MjA3MzM4MDkwOH0.RTf5GbtVWWi5-VIn8T1sjop9PGfkkopgY4lJY_gDWdM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// User operations
export async function getUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  return {
    name: profile.name,
    email: profile.email,
    avatar: profile.avatar_url
  };
}

export async function updateUser(user: User) {
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('users')
    .upsert({
      id: authUser.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar
    });

  if (error) throw error;
}

// Business profile operations
export async function saveBusinessProfile(profile: BusinessProfile): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('business_profiles')
    .insert({
      user_id: user.id,
      url: profile.url,
      description: profile.description,
      target_industry: profile.targetIndustry,
      location: profile.location,
      number_of_leads: profile.numberOfLeads,
      meeting_link: profile.meetingLink,
      custom_snippet: profile.customSnippet
    });

  if (error) throw error;
}

export async function getBusinessProfile(userId: string): Promise<SavedBusinessProfile | null> {
  const { data, error } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;

  return {
    url: data.url,
    description: data.description,
    targetIndustry: data.target_industry,
    location: data.location,
    numberOfLeads: data.number_of_leads,
    meetingLink: data.meeting_link,
    customSnippet: data.custom_snippet
  };
}

// Lead operations
export async function saveLeads(businessProfileId: string, leads: Lead[]): Promise<void> {
  const leadsToInsert = leads.map(lead => ({
    business_profile_id: businessProfileId,
    name: lead.name,
    description: lead.description,
    address: lead.address,
    website: lead.website,
    email: lead.email,
    justification: lead.justification,
    subject: lead.subject,
    body: lead.body,
    suggested_email: lead.suggestedEmail
  }));

  const { error } = await supabase
    .from('leads')
    .insert(leadsToInsert);

  if (error) throw error;
}

export async function getLeadHistory(userId: string): Promise<LeadHistoryItem[]> {
  const { data: profiles, error: profileError } = await supabase
    .from('business_profiles')
    .select(`
      *,
      leads (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (profileError || !profiles) return [];

  return profiles.map(profile => ({
    id: profile.id,
    date: profile.created_at,
    profile: {
      url: profile.url,
      description: profile.description,
      targetIndustry: profile.target_industry,
      location: profile.location,
      numberOfLeads: profile.number_of_leads,
      meetingLink: profile.meeting_link,
      customSnippet: profile.custom_snippet
    },
    leads: profile.leads.map((lead: any) => ({
      name: lead.name,
      description: lead.description,
      address: lead.address,
      website: lead.website,
      email: lead.email,
      justification: lead.justification,
      subject: lead.subject,
      body: lead.body,
      suggestedEmail: lead.suggested_email
    }))
  }));
}
