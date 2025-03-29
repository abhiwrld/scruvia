'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, getCurrentUser, getUserProfile, getUserPlan } from '@/utils/supabase';

type AuthContextType = {
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  plan: 'free' | 'plus' | 'pro' | 'team';
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [plan, setPlan] = useState<'free' | 'plus' | 'pro' | 'team'>('free');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      try {
        if (session && session.user) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setPlan('free');
        }
      } catch (error) {
        console.error('Error in auth state change handler:', error);
        // Don't reset user here as it might be a temporary error
      } finally {
        setIsLoading(false);
      }
    });

    // Check for existing session on load
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          console.log('Current user found:', currentUser.email);
          setUser(currentUser);
          await loadUserProfile(currentUser.id);
        } else {
          console.log('No current user found');
          // Reset state when no user is found
          setUser(null);
          setProfile(null);
          setPlan('free');
        }
      } catch (error) {
        console.error('Error checking user:', error);
        // Reset state on error to prevent showing stale data
        setUser(null);
        setProfile(null);
        setPlan('free');
      } finally {
        setIsLoading(false);
      }
    };

    // Initialize session
    checkUser();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('Loading user profile for:', userId);
      
      // Get user profile
      const userProfile = await getUserProfile(userId);
      if (userProfile) {
        console.log('User profile loaded successfully');
        setProfile(userProfile);
      } else {
        console.warn('No user profile found, using default');
        setProfile(null);
      }

      // Get user plan
      const userPlan = await getUserPlan(userId);
      if (userPlan) {
        console.log('User plan:', userPlan.plan);
        setPlan(userPlan.plan || 'free');
      } else {
        console.warn('No user plan found, using free plan');
        setPlan('free');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Set defaults if there's an error
      setProfile(null);
      setPlan('free');
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) throw error;
      
      if (data.user) {
        setUser(data.user);
        await loadUserProfile(data.user.id);
      }
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password 
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Initial user is created, but may need email verification
        // We don't automatically set the user here since they may need to verify email first
        // Instead, show a success message and redirect to login
      }
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setPlan('free');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        plan,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 