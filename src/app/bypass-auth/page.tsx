"use client";

import { useEffect, useState } from 'react';

export default function BypassAuthPage() {
  const [status, setStatus] = useState('Setting up test user...');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // Create a test user profile
      const testUser = {
        uid: 'test-user-123',
        userId: 'test-user-123',
        email: 'test@example.com',
        name: 'Test User',
        plan: 'free',
        questions_used: 0,
        createdAt: Date.now()
      };
      
      // Set up localStorage with test user data
      localStorage.setItem('user', JSON.stringify(testUser));
      localStorage.setItem('authenticated', 'true');
      localStorage.setItem('auth_successful', 'true');
      localStorage.setItem('auth_user_id', testUser.uid);
      
      // Clear any problematic session storage
      sessionStorage.clear();
      
      setStatus('Test user created! Redirecting to chat...');
      
      // Redirect to chat
      setTimeout(() => {
        window.location.href = '/chat';
      }, 1500);
    } catch (error) {
      setStatus(`Error setting up test user: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0c1220] flex items-center justify-center">
      <div className="bg-gray-800/70 p-8 rounded-lg shadow-2xl max-w-md w-full backdrop-blur-md border border-gray-700/50">
        <h1 className="text-2xl font-bold text-white mb-4">Auth Bypass</h1>
        
        <div className="text-gray-300 mb-6">
          {status}
        </div>
        
        <div className="animate-pulse flex justify-center">
          <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}
