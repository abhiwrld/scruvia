"use client";

import { useEffect } from 'react';

export default function AuthPage() {
  useEffect(() => {
    // Check if user is already authenticated using localStorage
    const isAuthenticated = () => {
      try {
        return localStorage.getItem('currentUser') !== null;
      } catch (e) {
        console.error('Error checking authentication:', e);
        return false;
      }
    };

    if (isAuthenticated()) {
      // Redirect to chat page if already authenticated
      console.log('User is authenticated, redirecting to chat');
      window.location.replace('/chat');
    } else {
      // Redirect to login page if not authenticated
      console.log('User is not authenticated, redirecting to login');
      window.location.replace('/login');
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0c1220]">
      <div className="p-8 bg-gray-800/60 backdrop-blur-md shadow-xl rounded-lg border border-gray-700/50">
        <h1 className="text-2xl font-bold mb-4 text-center text-white">Redirecting...</h1>
        <p className="text-gray-300 text-center">Please wait while we check your authentication status.</p>
        <div className="flex justify-center mt-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#9c6bff]"></div>
        </div>
      </div>
    </div>
  );
}
