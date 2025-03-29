"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function ResetAuthPage() {
  const [message, setMessage] = useState<string>('Click the button to reset all authentication data');
  const [isClearing, setIsClearing] = useState<boolean>(false);

  const resetAuth = () => {
    setIsClearing(true);
    setMessage('Clearing authentication data...');

    try {
      // Clear all localStorage items
      Object.keys(localStorage).forEach(key => {
        // Clear auth-related items
        if (
          key.includes('auth') ||
          key.includes('user') ||
          key.includes('token') ||
          key.includes('session')
        ) {
          localStorage.removeItem(key);
        }
      });

      // Clear all sessionStorage
      sessionStorage.clear();

      // Clear cookies (this method attempts to clear cookies but may not work for all cookies)
      document.cookie.split(';').forEach(c => {
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });

      setMessage('Authentication data cleared! You can now go back to the login page.');
    } catch (error) {
      setMessage(`Error clearing auth data: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="bg-gray-800 shadow-lg rounded-lg p-8 max-w-md w-full border border-gray-700">
        <h1 className="text-3xl font-bold text-white mb-6">Reset Authentication</h1>
        
        <div className="bg-gray-700 p-4 rounded-md mb-6 text-gray-300">
          <p className="mb-2">
            Use this utility to clear all authentication data if you're experiencing:
          </p>
          <ul className="list-disc list-inside mb-2 space-y-1">
            <li>Login loops</li>
            <li>Authentication errors</li>
            <li>Unable to log out</li>
          </ul>
          <p>This will clear all local authentication data and allow you to log in fresh.</p>
        </div>
        
        <div className={`mb-6 p-4 rounded-md ${message.includes('Error') ? 'bg-red-900/50 text-red-300' : message.includes('cleared') ? 'bg-green-900/50 text-green-300' : 'bg-blue-900/50 text-blue-300'}`}>
          {message}
        </div>
        
        <div className="flex flex-col space-y-4">
          <button
            onClick={resetAuth}
            disabled={isClearing}
            className="bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isClearing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Clearing Auth Data...
              </>
            ) : 'Reset All Authentication Data'}
          </button>
          
          <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md font-medium text-center">
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
