import { useState, useEffect, useCallback } from 'react';
import { User, UserData, BusinessProfile, Lead, LeadHistoryItem, SavedBusinessProfile } from '../types';
import { supabase, getUser, updateUser, saveBusinessProfile as saveProfile, getBusinessProfile, saveLeads, getLeadHistory } from '../services/supabaseService';

export const useUser = () => {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData>({ profile: null, history: [] });

    // Initialize user and data on mount
    useEffect(() => {
        const initializeUser = async () => {
            const currentUser = await getUser();
            if (currentUser) {
                setUser(currentUser);
                // Load user data
                const { data: { user: authUser } } = await supabase.auth.getUser();
                if (authUser) {
                    const profile = await getBusinessProfile(authUser.id);
                    const history = await getLeadHistory(authUser.id);
                    setUserData({ profile, history });
                }
            }
        };

        initializeUser();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
                setUser(null);
                setUserData({ profile: null, history: [] });
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const login = async (loggedInUser: User) => {
        try {
            await updateUser(loggedInUser);
            setUser(loggedInUser);
            
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                const profile = await getBusinessProfile(authUser.id);
                const history = await getLeadHistory(authUser.id);
                setUserData({ profile, history });
            }
        } catch (error) {
            console.error("Failed to update user profile:", error);
        }
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
            setUserData({ profile: null, history: [] });
        } catch (error) {
            console.error("Failed to sign out:", error);
        }
    };

    const saveBusinessProfile = useCallback(async (profile: BusinessProfile) => {
        try {
            await saveProfile(profile);
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                const savedProfile = await getBusinessProfile(authUser.id);
                setUserData(prevData => ({ ...prevData, profile: savedProfile }));
            }
        } catch (error) {
            console.error("Failed to save business profile:", error);
            throw error;
        }
    }, []);

    const addLeadHistory = useCallback(async (profile: BusinessProfile, leads: Lead[]) => {
        try {
            // Create a new history item
            const newHistoryItem: LeadHistoryItem = {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                date: new Date().toISOString(),
                profile: {
                    url: profile.url,
                    description: profile.description,
                    targetIndustry: profile.targetIndustry,
                    location: profile.location,
                    numberOfLeads: profile.numberOfLeads,
                    meetingLink: profile.meetingLink,
                    customSnippet: profile.customSnippet
                },
                leads
            };

            // First save the business profile
            await saveProfile(profile);
            
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) throw new Error('Not authenticated');

            // Get the newly created business profile
            const { data: latestProfile } = await supabase
                .from('business_profiles')
                .select('id')
                .eq('user_id', authUser.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (!latestProfile) throw new Error('Failed to get business profile');

            // Save the leads
            await saveLeads(latestProfile.id, leads);

            // Update local state immediately for better UX
            setUserData(prevData => ({
                ...prevData,
                history: [newHistoryItem, ...prevData.history]
            }));

            // Then refresh from server to ensure consistency
            const history = await getLeadHistory(authUser.id);
            setUserData(prevData => ({ ...prevData, history }));
        } catch (error) {
            console.error("Failed to add lead history:", error);
            throw error;
        }
    }, []);

    return { user, userData, login, logout, saveBusinessProfile, addLeadHistory };
};
