"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PhoneVerification from '../components/PhoneVerification';
import { getCurrentUser, getUserProfile, updateUserProfile as updateSupabaseProfile } from '@/utils/supabase';

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    // Load user data from Supabase
    const loadUserData = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          console.log('Current user found:', currentUser.email);
          setUser(currentUser);
          
          // Get user profile from Supabase
          const profile = await getUserProfile(currentUser.id);
          if (profile) {
            console.log('Profile loaded:', profile);
            setUserProfile(profile);
            setDisplayName(profile.name || '');
            
            // Update localStorage for consistent local state
            localStorage.setItem('currentUser', JSON.stringify(profile));
            localStorage.setItem('user', JSON.stringify(profile));
          } else {
            console.warn('No profile found for user');
            router.push('/login');
          }
        } else {
          console.log('No current user found');
          router.push('/login');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    
    loadUserData();
  }, [router]);

  const updateUserProfile = async (name: string) => {
    if (!user || !user.id) {
      throw new Error('User not authenticated');
    }
    
    try {
      // Update profile in Supabase
      await updateSupabaseProfile(user.id, { 
        name,
        updated_at: new Date().toISOString()
      });
      
      // Update local state
      const updatedProfile = {
        ...userProfile,
        name
      };
      
      // Update localStorage for consistent local state
      localStorage.setItem('currentUser', JSON.stringify(updatedProfile));
      localStorage.setItem('user', JSON.stringify(updatedProfile));
      
      // Also update user in 'users' collection if it exists
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      if (users[userProfile.id]) {
        users[userProfile.id] = {
          ...users[userProfile.id],
          name
        };
        localStorage.setItem('users', JSON.stringify(users));
      }
      
      setUser(updatedProfile);
      setUserProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error('Failed to update profile in Supabase');
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('user');
      localStorage.removeItem('authenticated');
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      await updateUserProfile(displayName);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (error: any) {
      setMessage({ text: error.message || 'Failed to update profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleVerificationComplete = () => {
    setShowPhoneVerification(false);
    
    // Update user profile to set phoneVerified to true
    const updatedProfile = {
      ...userProfile,
      phoneVerified: true,
      phoneNumber: '555-555-5555' // In a real app, this would be the actual verified number
    };
    // Update both localStorage keys to ensure consistency
    localStorage.setItem('currentUser', JSON.stringify(updatedProfile));
    localStorage.setItem('user', JSON.stringify(updatedProfile));
    setUserProfile(updatedProfile);
    
    setMessage({ text: 'Phone number verified successfully!', type: 'success' });
  };

  if (!user || !userProfile) {
    return (
      <div className="min-h-screen bg-[#0c1220] flex flex-col items-center justify-center py-12 px-6">
        <div className="bg-gray-800/40 backdrop-blur-md rounded-xl p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-white mb-4">Not logged in</h2>
          <p className="text-gray-300 mb-6">Please log in to view your profile.</p>
          <button
            onClick={() => router.push('/login')}
            className="w-full py-2 px-4 bg-gradient-to-r from-[#9c6bff] to-[#00c8ff] hover:opacity-90 rounded-md text-white transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c1220] flex flex-col py-12 px-6 md:px-12 relative overflow-hidden">
      {/* Back to chat button */}
      <div className="absolute top-4 left-4 z-10">
        <Link href="/chat" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Chat</span>
        </Link>
      </div>
      {showPhoneVerification && (
        <PhoneVerification
          onVerificationComplete={handleVerificationComplete}
          onCancel={() => setShowPhoneVerification(false)}
        />
      )}
      
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#9c6bff]/20 to-[#00c8ff]/20 opacity-30"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#9c6bff] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00c8ff] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
      </div>

      <div className="max-w-4xl mx-auto w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Your Profile</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="bg-gray-800/40 backdrop-blur-md rounded-xl overflow-hidden border border-gray-700/50 p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-r from-[#9c6bff] to-[#00c8ff] rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <h3 className="text-xl font-semibold text-white">{userProfile.name}</h3>
              <p className="text-gray-400">{userProfile.email}</p>
            </div>
            
            <div className="border-t border-gray-700/50 pt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-300">Current Plan</span>
                <span className="bg-gradient-to-r from-[#9c6bff]/80 to-[#00c8ff]/80 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {userProfile.plan.charAt(0).toUpperCase() + userProfile.plan.slice(1)}
                </span>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-300">Questions Used</span>
                <span className="text-gray-300">{userProfile.questions_used || 0}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Phone Verified</span>
                {userProfile.phoneVerified ? (
                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                    Verified
                  </span>
                ) : (
                  <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-medium">
                    Not Verified
                  </span>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <button
                onClick={handleLogout}
                className="w-full py-2 px-4 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700/50 transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2">
            {/* Profile Settings */}
            <div className="bg-gray-800/40 backdrop-blur-md rounded-xl overflow-hidden border border-gray-700/50 mb-8">
              <div className="p-6 border-b border-gray-700/50">
                <h3 className="text-xl font-semibold text-white">Profile Settings</h3>
              </div>
              
              <div className="p-6">
                {message.text && (
                  <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {message.text}
                  </div>
                )}
                
                <form onSubmit={handleUpdateProfile}>
                  <div className="mb-6">
                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="py-2 px-4 bg-gradient-to-r from-[#9c6bff]/80 to-[#00c8ff]/80 hover:from-[#9c6bff] hover:to-[#00c8ff] rounded-md text-white transition-all shadow-md shadow-[#9c6bff]/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </>
                      ) : 'Update Profile'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
            
            {/* Phone Verification */}
            <div className="bg-gray-800/40 backdrop-blur-md rounded-xl overflow-hidden border border-gray-700/50">
              <div className="p-6 border-b border-gray-700/50">
                <h3 className="text-xl font-semibold text-white">Phone Verification</h3>
              </div>
              
              <div className="p-6">
                <p className="text-gray-300 mb-6">
                  {userProfile.phoneVerified 
                    ? `Your phone number (${userProfile.phoneNumber}) has been verified.` 
                    : "You haven't verified your phone number yet. Phone verification is required for premium plans."}
                </p>
                
                {!userProfile.phoneVerified && (
                  <button
                    onClick={() => setShowPhoneVerification(true)}
                    className="py-2 px-4 bg-gradient-to-r from-[#9c6bff]/80 to-[#00c8ff]/80 hover:from-[#9c6bff] hover:to-[#00c8ff] rounded-md text-white transition-all shadow-md shadow-[#9c6bff]/20"
                  >
                    Verify Phone Number
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
