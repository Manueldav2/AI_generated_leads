import React, { useEffect } from 'react';
import { User } from '../types';
import { GoogleIcon } from './icons/GoogleIcon';
import { supabase } from '../services/supabaseService';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Get the user profile from our users table
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          onLogin({
            name: profile.name,
            email: profile.email,
            avatar: profile.avatar_url
          });
        } else {
          // Create a new profile if it doesn't exist
          const { error } = await supabase
            .from('users')
            .insert({
              id: session.user.id,
              name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              avatar_url: session.user.user_metadata.avatar_url
            });

          if (!error) {
            onLogin({
              name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              avatar: session.user.user_metadata.avatar_url
            });
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [onLogin]);

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) {
      console.error('Error signing in:', error.message);
    }
  };

  return (
    <div className="auth-container glass-card">
      <h2 className="auth-title">Welcome Back</h2>
      <p className="auth-description">Sign in to manage your leads and search history.</p>
      
      <button
        onClick={handleSignIn}
        className="google-signin-button"
      >
        <div className="button-content">
          <GoogleIcon className="google-icon" />
          <span>Sign in with Google</span>
        </div>
        <div className="button-shine"></div>
      </button>
      
      <div className="auth-features">
        <div className="auth-feature">
          <span className="feature-check">✓</span>
          <span>No credit card required</span>
        </div>
        <div className="auth-feature">
          <span className="feature-check">✓</span>
          <span>Free to get started</span>
        </div>
        <div className="auth-feature">
          <span className="feature-check">✓</span>
          <span>Cancel anytime</span>
        </div>
      </div>
    </div>
  );
};
