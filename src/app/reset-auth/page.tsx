"use client";

import { useState } from 'react';
import Link from 'next/link';
import { resetAuthState } from '@/utils/supabase';

export default function ResetAuthPage() {
  const [message, setMessage] = useState<string>('Click the button to reset all authentication data');
  const [isClearing, setIsClearing] = useState<boolean>(false);

  const resetAuth = async () => {
    setIsClearing(true);
    setMessage('Clearing authentication data...');

    try {
      const success = await resetAuthState();
      
      if (success) {
        setMessage('Authentication data cleared! You can now go back to the login page.');
      } else {
        setMessage('There was an issue resetting your authentication state. Please try again.');
      }
    } catch (error) {
      setMessage(`Error clearing auth data: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c1220] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold">
          <span className="bg-gradient-to-r from-[#9c6bff] to-[#00c8ff] bg-clip-text text-transparent">
            SCRUVIA
          </span>
        </h1>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Reset Authentication
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Use this page if you're having issues logging in
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800/40 backdrop-blur-md py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-700/50">
          <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-md text-white text-sm">
            <p>{message}</p>
          </div>
          
          <div className="space-y-6">
            <button
              onClick={resetAuth}
              disabled={isClearing}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isClearing ? 'Resetting...' : 'Reset Authentication Data'}
            </button>
            
            <div className="text-center">
              <Link href="/login" className="text-sm font-medium text-[#00c8ff] hover:text-[#9c6bff]">
                Return to login page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
