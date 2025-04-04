"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, getUserProfile, updateUserProfile as updateSupabaseProfile, getUserFiles, deleteUserFile } from '@/utils/supabase';

type Tab = 'profile' | 'uploads';

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [userFiles, setUserFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');
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
            
            // Check if there's a pending verification needed
            const verificationNeeded = localStorage.getItem('profileVerificationNeeded');
            if (verificationNeeded === 'true' && !profile.phoneVerified) {
              // Set the active tab to profile to show phone field
              setActiveTab('profile');
              
              // Show a message about completing verification for upgrade
              setMessage({ 
                text: 'Please add your phone number to continue with your plan upgrade', 
                type: 'warning'
              });
              
              // Clear the flag
              localStorage.removeItem('profileVerificationNeeded');
            }
            
            // Check if there's a pending plan upgrade
            const pendingPlan = localStorage.getItem('pendingUpgradePlan');
            if (pendingPlan && profile.phoneVerified) {
              // Show message about continuing to upgrade
              setMessage({
                text: `Your profile is now verified! You can continue upgrading to the ${pendingPlan.charAt(0).toUpperCase() + pendingPlan.slice(1)} plan.`,
                type: 'success'
              });
            }
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

  // Load user files when uploads tab is selected
  const loadUserFiles = async () => {
    if (!user || !user.id) return;
    
    setLoadingFiles(true);
    try {
      const files = await getUserFiles(user.id);
      setUserFiles(files);
    } catch (error) {
      console.error('Error loading user files:', error);
    } finally {
      setLoadingFiles(false);
    }
  };
  
  // Update user files list when uploads tab is selected
  useEffect(() => {
    if (activeTab === 'uploads') {
      loadUserFiles();
    }
  }, [activeTab, user]);

  // Handle file deletion
  const handleDeleteFile = async (fileId: string, filePath: string) => {
    if (!confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      return;
    }
    
    setLoadingFiles(true);
    setDeleteMessage('');
    
    try {
      await deleteUserFile(fileId, filePath);
      // Refresh file list
      loadUserFiles();
      setDeleteMessage('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      setDeleteMessage('Failed to delete file. Please try again.');
    } finally {
      setLoadingFiles(false);
    }
  };

  const updateUserProfile = async (id: string, profileUpdate: any) => {
    if (!user || !user.id) {
      throw new Error('User not authenticated');
    }
    
    try {
      // Update profile in Supabase
      await updateSupabaseProfile(id, profileUpdate);
      
      // Update local state
      const updatedProfile = {
        ...userProfile,
        ...profileUpdate
      };
      
      // Update localStorage for consistent local state
      localStorage.setItem('currentUser', JSON.stringify(updatedProfile));
      localStorage.setItem('user', JSON.stringify(updatedProfile));
      
      // Also update user in 'users' collection if it exists
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      if (users[userProfile.id]) {
        users[userProfile.id] = {
          ...users[userProfile.id],
          ...profileUpdate
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
      // Check if phone number is provided
      const phoneVerified = Boolean(userProfile.phoneNumber && userProfile.phoneNumber.length > 0);
      
      // Create profile update object
      const profileUpdate = { 
        name: displayName,
        phoneNumber: userProfile.phoneNumber || '',
        phoneVerified: phoneVerified
      };
      
      // Update the profile
      await updateUserProfile(userProfile.id, profileUpdate);
      
      // Update local userProfile
      setUserProfile({
        ...userProfile,
        name: displayName,
        phoneVerified: phoneVerified
      });
      
      let successMessage = 'Profile updated successfully!';
      if (phoneVerified && localStorage.getItem('pendingUpgradePlan')) {
        successMessage += ' You can now proceed with your plan upgrade.';
      }
      
      setMessage({ text: successMessage, type: 'success' });
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
    
    // Check if there's a pending plan upgrade
    const pendingPlan = localStorage.getItem('pendingUpgradePlan');
    if (pendingPlan) {
      setMessage({ 
        text: `Phone number verified successfully! You can now continue with your ${pendingPlan.charAt(0).toUpperCase() + pendingPlan.slice(1)} plan upgrade.`, 
        type: 'success' 
      });
    } else {
      setMessage({ text: 'Phone number verified successfully!', type: 'success' });
    }
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
            {/* Tabs */}
            <div className="bg-gray-800/40 backdrop-blur-md rounded-xl overflow-hidden border border-gray-700/50 mb-6">
              <div className="flex border-b border-gray-700/50">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                    activeTab === 'profile' 
                      ? 'text-white border-b-2 border-[#00c8ff]' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Profile Settings
                </button>
                
                <button
                  onClick={() => setActiveTab('uploads')}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-colors relative ${
                    activeTab === 'uploads' 
                      ? 'text-white border-b-2 border-[#00c8ff]' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  My Uploads
                  <span className="absolute -top-1 -right-1 flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00c8ff] opacity-50"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-[#00c8ff] text-xs items-center justify-center font-bold">
                      New
                    </span>
                  </span>
                </button>
              </div>
            </div>
            
            {/* Profile Settings */}
            {activeTab === 'profile' && (
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
                  
                  {!userProfile.phoneVerified && (
                    <div className="mb-6 p-4 flex items-start rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <svg className="w-6 h-6 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <h4 className="text-white font-medium mb-1">Complete your profile verification</h4>
                        <p className="text-gray-300 text-sm mb-3">
                          Your profile is incomplete. Phone verification is required to upgrade to premium plans.
                        </p>
                        <button
                          type="button"
                          className="text-sm text-[#00c8ff] hover:text-[#00c8ff]/80 flex items-center"
                        >
                          Enter your phone number above
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
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

                    <div className="mb-6">
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number <span className="text-xs text-blue-400">(Required for premium plans)</span>
                      </label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        value={userProfile.phoneNumber || ''}
                        onChange={(e) => {
                          const newPhoneNumber = e.target.value;
                          setUserProfile({
                            ...userProfile,
                            phoneNumber: newPhoneNumber,
                            phoneVerified: Boolean(newPhoneNumber.length > 0)
                          });
                        }}
                        placeholder="(555) 555-5555"
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {userProfile.phoneVerified 
                          ? "Your phone number has been saved" 
                          : "Enter your phone number to enable premium plan upgrades"}
                      </p>
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
            )}
            
            {/* Phone Verification */}
            {activeTab === 'verification' && (
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
            )}
            
            {/* My Uploads */}
            {activeTab === 'uploads' && (
              <div className="bg-gray-800/40 backdrop-blur-md rounded-xl overflow-hidden border border-gray-700/50">
                <div className="p-6 border-b border-gray-700/50">
                  <h3 className="text-xl font-semibold text-white">My Uploads</h3>
                </div>
                
                <div className="p-6">
                  {/* Banner notification for the new feature */}
                  <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-[#9c6bff]/20 to-[#00c8ff]/20 border border-[#00c8ff]/50">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#00c8ff] mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium text-white text-lg">New Feature: My Uploads</span>
                    </div>
                    <p className="mt-2 text-gray-300 ml-9">
                      You can now view and manage all your uploaded files in one place! 
                      Files that you upload in chat conversations will appear here for easy access.
                    </p>
                  </div>
                  
                  {deleteMessage && (
                    <div className={`mb-6 p-4 rounded-md ${deleteMessage.includes('success') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {deleteMessage}
                    </div>
                  )}
                  
                  {loadingFiles ? (
                    <div className="py-12 flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9c6bff]"></div>
                      <p className="mt-4 text-gray-300">Loading your files...</p>
                    </div>
                  ) : (
                    <>
                      {userFiles.length === 0 ? (
                        <div className="text-center py-12">
                          <svg className="w-16 h-16 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="mt-4 text-gray-300">You haven't uploaded any files yet.</p>
                          <p className="mt-2 text-gray-400 text-sm">Files you upload in chat will appear here.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-700/30">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">File Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Size</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Uploaded</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/30">
                              {userFiles.map((file) => (
                                <tr key={file.id} className="hover:bg-gray-700/20">
                                  <td className="px-4 py-3 text-sm text-white">{file.file_name}</td>
                                  <td className="px-4 py-3 text-sm text-gray-300">{file.file_type}</td>
                                  <td className="px-4 py-3 text-sm text-gray-300">{formatFileSize(file.file_size)}</td>
                                  <td className="px-4 py-3 text-sm text-gray-300">{file.created_at_formatted}</td>
                                  <td className="px-4 py-3 text-sm text-right">
                                    <div className="flex items-center justify-end space-x-3">
                                      <a 
                                        href={file.public_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 transition-colors"
                                      >
                                        <span className="sr-only">View</span>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                      </a>
                                      <button 
                                        onClick={() => handleDeleteFile(file.id, file.file_path)}
                                        className="text-red-400 hover:text-red-300 transition-colors"
                                      >
                                        <span className="sr-only">Delete</span>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
