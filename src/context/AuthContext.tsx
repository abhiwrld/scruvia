'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, getCurrentUser, getUserProfile, getUserPlan, signInWithEmail } from '@/utils/supabase';
import { useRouter, usePathname } from 'next/navigation';

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
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    // Check for existing session on load
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser && mounted) {
          console.log('Initial check: Current user found:', currentUser.email);
          setUser(currentUser);
          await loadUserProfile(currentUser.id);
        } else if (mounted) {
          console.log('Initial check: No current user found');
          setUser(null);
          setProfile(null);
          setPlan('free');
        }
      } catch (error) {
        console.error('Error checking user:', error);
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
      console.log('Auth state changed:', event, 'Session:', !!session);
      try {
        if (session && session.user && mounted) {
          console.log('Auth listener: Session user found');
          setUser(session.user);
          await loadUserProfile(session.user.id);

          // Redirect on SIGNED_IN or INITIAL_SESSION if not already on chat page
          if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && pathname !== '/chat') {
            console.log(`Auth listener: ${event} event detected, redirecting to /chat from ${pathname} using location.replace`);
            // Prioritize window.location.replace for a more forceful redirect
            window.location.replace('/chat'); 
          }
        } else if (mounted && event === 'SIGNED_OUT') {
          console.log('Auth listener: User signed out');
          setUser(null);
          setProfile(null);
          setPlan('free');
          if (pathname !== '/login') {
             console.log('Redirecting to /login after sign out');
             router.push('/login');
          }
        }
      } catch (error) {
        console.error('Error in auth state change handler:', error);
      } finally {
        if (mounted && event !== 'INITIAL_SESSION') {
          setIsLoading(false);
        }
      }
    });

    // Initialize session check
    checkUser();

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [router, pathname]);

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
      await signInWithEmail(email, password, rememberMe);
    } catch (error) {
      console.error('Error signing in:', error);
      setIsLoading(false);
      throw error;
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