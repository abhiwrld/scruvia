'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabaseClient';
import { getCurrentUser, getUserProfile, getUserPlan, signInWithEmail } from '@/utils/supabase';
import { useRouter } from 'next/navigation';

type AuthContextType = {
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  plan: 'free' | 'plus' | 'pro' | 'team';
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [plan, setPlan] = useState<'free' | 'plus' | 'pro' | 'team'>('free');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    // Check for existing session on load
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser && mounted) {
          console.log('Current user found:', currentUser.email);
          setUser(currentUser);
          await loadUserProfile(currentUser.id);
          
          // Check if we need to redirect user to chat
          if (typeof window !== 'undefined') {
            const path = window.location.pathname;
            if (path === '/' || path === '/login' || path === '/signup') {
              console.log('User is authenticated and on auth page, redirecting to chat');
              window.location.href = '/chat';
            }
          }
        } else if (mounted) {
          console.log('No current user found');
          // Reset state when no user is found
          setUser(null);
          setProfile(null);
          setPlan('free');
        }
      } catch (error) {
        console.error('Error checking user:', error);
        // Reset state on error to prevent showing stale data
        if (mounted) {
          setUser(null);
          setProfile(null);
          setPlan('free');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      try {
        if (session && session.user && mounted) {
          console.log('Session user found in auth state change');
          setUser(session.user);
          await loadUserProfile(session.user.id);
          
          // If this is a SIGNED_IN event, force redirect to chat page
          if (event === 'SIGNED_IN' && typeof window !== 'undefined') {
            console.log('SIGNED_IN event detected, redirecting to chat');
            
            // Wait for a short period to ensure everything is properly set up
            setTimeout(() => {
              // First try using the router
              try {
                router.push('/chat');
              } catch (e) {
                console.warn('Router push failed, using window.location.href instead', e);
                // Fall back to direct location change if router fails
                window.location.href = '/chat';
              }
            }, 300);
          }
        } else if (mounted && event === 'SIGNED_OUT') {
          console.log('User signed out in auth state change');
          setUser(null);
          setProfile(null);
          setPlan('free');
        }
      } catch (error) {
        console.error('Error in auth state change handler:', error);
        // Don't reset user here as it might be a temporary error
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    });

    // Initialize session
    checkUser();

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [router]);

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

  const signIn = async (email: string, password: string, rememberMe: boolean = true) => {
    setIsLoading(true);
    try {
      const { user } = await signInWithEmail(email, password, rememberMe);
      
      if (user) {
        setUser(user);
        await loadUserProfile(user.id);
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