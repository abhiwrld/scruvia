"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PerplexityModel, MODEL_DISPLAY_NAMES } from '@/utils/perplexity-api';
import { getCurrentUser, getUserProfile, updateUserProfile as updateSupabaseProfile, getUserFiles, deleteUserFile } from '@/utils/supabase';

type UserData = {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'plus' | 'pro' | 'team';
  questions_used?: number;
  phoneVerified?: boolean;
  phoneNumber?: string;
  accountCreated?: string;
  preferences?: {
    darkMode?: boolean;
    notifications?: {
      email: boolean;
      push: boolean;
    };
    defaultModel?: string;
  };
};

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'appearance' | 'uploads'>('profile');
  const [userFiles, setUserFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');
  
  // Form states
  const [displayName, setDisplayName] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [defaultModel, setDefaultModel] = useState('sonar');

  useEffect(() => {
    // Load user data from Supabase
    const loadUserData = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          console.log('Current user found:', currentUser.email);
          
          // Get user profile from Supabase
          const profile = await getUserProfile(currentUser.id);
          if (profile) {
            console.log('Profile loaded:', profile);
            // Combine profile with user data
            const userData: UserData = {
              id: currentUser.id,
              name: profile.name || '',
              email: currentUser.email || '',
              plan: profile.plan || 'free',
              questions_used: profile.questions_used || 0,
              preferences: {
                darkMode: true,
                notifications: {
                  email: false,
                  push: false
                },
                defaultModel: 'sonar'
              }
            };
            
            setUser(userData);
            
            // Initialize form states
            setDisplayName(userData.name);
            setEmailNotifications(userData.preferences?.notifications?.email || false);
            setPushNotifications(userData.preferences?.notifications?.push || false);
            setDarkMode(userData.preferences?.darkMode !== undefined ? userData.preferences.darkMode : true);
            setDefaultModel(userData.preferences?.defaultModel || 'sonar');
            
            // Update localStorage for consistent local state
            localStorage.setItem('currentUser', JSON.stringify(userData));
            localStorage.setItem('user', JSON.stringify(userData));
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

  const saveSettings = async () => {
    if (!user || !user.id) return;
    
    setLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      // Check if phone number is provided
      const phoneVerified = Boolean(user.phoneNumber && user.phoneNumber.length > 0);
      
      // Create updated user object with all preferences
      const updatedUser = {
        ...user,
        name: displayName,
        phoneVerified,
        preferences: {
          darkMode,
          notifications: {
            email: emailNotifications,
            push: pushNotifications
          },
          defaultModel
        }
      };
      
      // Update profile in Supabase
      await updateSupabaseProfile(user.id, {
        name: displayName,
        phone_number: user.phoneNumber || '',
        phone_verified: phoneVerified,
        updated_at: new Date().toISOString()
      });
      
      // Save to localStorage for consistent local state
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      let successMessage = 'Settings saved successfully!';
      if (phoneVerified && localStorage.getItem('pendingUpgradePlan')) {
        successMessage += ' You can now proceed with your plan upgrade.';
      }
      
      setMessage({ text: successMessage, type: 'success' });
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ text: 'Failed to save settings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('user');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authenticated');
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

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
  
  // Update user files list when uploads tab is selected
  useEffect(() => {
    if (activeTab === 'uploads') {
      loadUserFiles();
    }
  }, [activeTab, user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0c1220] flex flex-col items-center justify-center py-12 px-6">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-700 rounded-full mb-4"></div>
          <div className="h-6 w-32 bg-gray-700 rounded mb-3"></div>
          <div className="h-4 w-48 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c1220] flex flex-col py-12 px-6 relative">
      {/* Back to chat button */}
      <div className="absolute top-4 left-4 z-10">
        <Link href="/chat" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Chat</span>
        </Link>
      </div>
      
      {/* Gradient background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#9c6bff]/10 to-[#00c8ff]/10 opacity-50"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#9c6bff] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00c8ff] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto w-full flex-1 z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Settings</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar with user info */}
          <div className="md:col-span-1">
            <div className="bg-gray-800/40 backdrop-blur-md rounded-xl border border-gray-700/50 overflow-hidden">
              {/* User profile section */}
              <div className="p-6 flex flex-col items-center">
                <div className="w-20 h-20 bg-gradient-to-r from-[#9c6bff] to-[#00c8ff] rounded-full flex items-center justify-center text-white text-xl font-bold mb-4 shadow-lg shadow-[#9c6bff]/20">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-lg font-medium text-white mb-1">{user.name || 'User'}</h3>
                <p className="text-sm text-gray-400 mb-3">{user.email}</p>
                <div className="bg-gray-900/40 rounded-full px-3 py-1 text-sm text-transparent bg-clip-text bg-gradient-to-r from-[#9c6bff] to-[#00c8ff] font-medium">
                  {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} Plan
                </div>
              </div>

              {/* Navigation tabs */}
              <div className="px-4 pb-4">
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center w-full px-4 py-3 rounded-lg mb-2 transition-all ${
                    activeTab === 'profile' 
                      ? 'bg-gradient-to-r from-[#9c6bff]/20 to-[#00c8ff]/10 border-l-2 border-[#00c8ff] text-white' 
                      : 'hover:bg-gray-800/50 text-gray-300 hover:text-white'
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </button>

                <button 
                  onClick={() => setActiveTab('notifications')}
                  className={`flex items-center w-full px-4 py-3 rounded-lg mb-2 transition-all ${
                    activeTab === 'notifications' 
                      ? 'bg-gradient-to-r from-[#9c6bff]/20 to-[#00c8ff]/10 border-l-2 border-[#00c8ff] text-white' 
                      : 'hover:bg-gray-800/50 text-gray-300 hover:text-white'
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Notifications
                </button>

                <button 
                  onClick={() => setActiveTab('appearance')}
                  className={`flex items-center w-full px-4 py-3 rounded-lg mb-2 transition-all ${
                    activeTab === 'appearance' 
                      ? 'bg-gradient-to-r from-[#9c6bff]/20 to-[#00c8ff]/10 border-l-2 border-[#00c8ff] text-white' 
                      : 'hover:bg-gray-800/50 text-gray-300 hover:text-white'
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  Appearance
                </button>

                <button 
                  onClick={() => setActiveTab('uploads')}
                  className={`flex items-center w-full px-4 py-3 rounded-lg mb-2 transition-all ${
                    activeTab === 'uploads' 
                      ? 'bg-gradient-to-r from-[#9c6bff]/20 to-[#00c8ff]/10 border-l-2 border-[#00c8ff] text-white' 
                      : 'hover:bg-gray-800/50 text-gray-300 hover:text-white'
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  My Uploads
                  <span className="ml-auto bg-[#00c8ff]/80 text-xs text-white px-2 py-0.5 rounded-full">
                    New
                  </span>
                </button>

                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 rounded-lg mt-4 text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Main settings panel */}
          <div className="md:col-span-3">
            <div className="bg-gray-800/40 backdrop-blur-md rounded-xl border border-gray-700/50 overflow-hidden">
              {message.text && (
                <div className={`mx-6 mt-6 p-4 rounded-lg flex items-center ${
                  message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {message.type === 'success' ? (
                    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <span>{message.text}</span>
                </div>
              )}

              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-6">Profile Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-[#00c8ff]/50 focus:border-transparent transition-all shadow-inner"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full px-4 py-2.5 bg-gray-700/30 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
                      />
                      <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                    </div>

                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number <span className="text-xs text-[#00c8ff]">(Required for premium plans)</span>
                      </label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        value={user.phoneNumber || ''}
                        onChange={(e) => {
                          if (user) {
                            setUser({
                              ...user,
                              phoneNumber: e.target.value,
                              phoneVerified: Boolean(e.target.value.length > 0)
                            });
                          }
                        }}
                        placeholder="(555) 555-5555"
                        className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-[#00c8ff]/50 focus:border-transparent transition-all shadow-inner"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {user.phoneVerified 
                          ? "Your phone number has been saved" 
                          : "Enter your phone number to enable premium plan upgrades"}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Current Plan
                        </label>
                        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-700/30 border border-gray-700 rounded-lg">
                          <span className="text-white">{user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}</span>
                          {user.plan !== 'team' && (
                            <Link 
                              href="/pricing" 
                              className="text-sm text-[#00c8ff] hover:text-[#9c6bff] transition-colors"
                            >
                              Upgrade
                            </Link>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Questions Used
                        </label>
                        <div className="px-4 py-2.5 bg-gray-700/30 border border-gray-700 rounded-lg">
                          <span className="text-white">{user.questions_used || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 mt-8">
                      <button
                        onClick={saveSettings}
                        disabled={loading}
                        className="px-6 py-2.5 bg-gradient-to-r from-[#9c6bff] to-[#00c8ff] text-white rounded-lg hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#9c6bff]/20 hover:shadow-[#9c6bff]/30 flex items-center justify-center"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </>
                        ) : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-6">Notification Settings</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <h3 className="text-white font-medium">Email Notifications</h3>
                        <p className="text-sm text-gray-400">Receive updates and tips via email</p>
                      </div>
                      <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                        <input
                          type="checkbox"
                          id="emailToggle"
                          className="absolute w-0 h-0 opacity-0"
                          checked={emailNotifications}
                          onChange={() => setEmailNotifications(!emailNotifications)}
                        />
                        <label
                          htmlFor="emailToggle"
                          className={`block w-12 h-6 overflow-hidden rounded-full cursor-pointer transition-colors duration-300 ${
                            emailNotifications ? 'bg-gradient-to-r from-[#9c6bff] to-[#00c8ff]' : 'bg-gray-700'
                          }`}
                        >
                          <span
                            className={`absolute block w-4 h-4 mt-1 ml-1 transition-transform duration-300 transform bg-white rounded-full ${
                              emailNotifications ? 'translate-x-6' : ''
                            }`}
                          ></span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-3 border-t border-gray-700/50">
                      <div>
                        <h3 className="text-white font-medium">Push Notifications</h3>
                        <p className="text-sm text-gray-400">Receive real-time alerts in your browser</p>
                      </div>
                      <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                        <input
                          type="checkbox"
                          id="pushToggle"
                          className="absolute w-0 h-0 opacity-0"
                          checked={pushNotifications}
                          onChange={() => setPushNotifications(!pushNotifications)}
                        />
                        <label
                          htmlFor="pushToggle"
                          className={`block w-12 h-6 overflow-hidden rounded-full cursor-pointer transition-colors duration-300 ${
                            pushNotifications ? 'bg-gradient-to-r from-[#9c6bff] to-[#00c8ff]' : 'bg-gray-700'
                          }`}
                        >
                          <span
                            className={`absolute block w-4 h-4 mt-1 ml-1 transition-transform duration-300 transform bg-white rounded-full ${
                              pushNotifications ? 'translate-x-6' : ''
                            }`}
                          ></span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 mt-8">
                      <button
                        onClick={saveSettings}
                        disabled={loading}
                        className="px-6 py-2.5 bg-gradient-to-r from-[#9c6bff] to-[#00c8ff] text-white rounded-lg hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#9c6bff]/20 hover:shadow-[#9c6bff]/30 flex items-center justify-center"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </>
                        ) : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-6">Appearance Settings</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <h3 className="text-white font-medium">Dark Mode</h3>
                        <p className="text-sm text-gray-400">Toggle between dark and light mode</p>
                      </div>
                      <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                        <input
                          type="checkbox"
                          id="darkModeToggle"
                          className="absolute w-0 h-0 opacity-0"
                          checked={darkMode}
                          onChange={() => setDarkMode(!darkMode)}
                        />
                        <label
                          htmlFor="darkModeToggle"
                          className={`block w-12 h-6 overflow-hidden rounded-full cursor-pointer transition-colors duration-300 ${
                            darkMode ? 'bg-gradient-to-r from-[#9c6bff] to-[#00c8ff]' : 'bg-gray-700'
                          }`}
                        >
                          <span
                            className={`absolute block w-4 h-4 mt-1 ml-1 transition-transform duration-300 transform bg-white rounded-full ${
                              darkMode ? 'translate-x-6' : ''
                            }`}
                          ></span>
                        </label>
                      </div>
                    </div>

                    <div className="py-3 border-t border-gray-700/50">
                      <h3 className="text-white font-medium mb-2">Default AI Model</h3>
                      <p className="text-sm text-gray-400 mb-4">Select which AI model to use by default</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button
                          onClick={() => setDefaultModel('sonar')}
                          className={`px-4 py-3 rounded-lg text-center transition-all ${
                            defaultModel === 'sonar'
                              ? 'bg-gradient-to-r from-[#9c6bff]/20 to-[#00c8ff]/10 border border-[#00c8ff]/50 text-white'
                              : 'bg-gray-800/50 border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white'
                          }`}
                        >
                          {MODEL_DISPLAY_NAMES['sonar']}
                        </button>
                        <button
                          onClick={() => setDefaultModel('sonar-reasoning-pro')}
                          className={`px-4 py-3 rounded-lg text-center transition-all ${
                            defaultModel === 'sonar-reasoning-pro'
                              ? 'bg-gradient-to-r from-[#9c6bff]/20 to-[#00c8ff]/10 border border-[#00c8ff]/50 text-white'
                              : 'bg-gray-800/50 border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white'
                          }`}
                          disabled={user.plan === 'free' || user.plan === 'plus'}
                        >
                          {MODEL_DISPLAY_NAMES['sonar-reasoning-pro']}
                          {(user.plan === 'free' || user.plan === 'plus') && (
                            <div className="text-xs mt-1 text-gray-500">Pro plan required</div>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 mt-8">
                      <button
                        onClick={saveSettings}
                        disabled={loading}
                        className="px-6 py-2.5 bg-gradient-to-r from-[#9c6bff] to-[#00c8ff] text-white rounded-lg hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#9c6bff]/20 hover:shadow-[#9c6bff]/30 flex items-center justify-center"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </>
                        ) : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* My Uploads Tab */}
      {activeTab === 'uploads' && (
        <div className="md:col-span-3">
          <div className="bg-gray-800/40 backdrop-blur-md rounded-xl border border-gray-700/50 overflow-hidden">
            <div className="p-6 border-b border-gray-700/50">
              <h2 className="text-xl font-semibold text-white">My Uploads</h2>
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
        </div>
      )}
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