"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AuthState {
  localStorage: { [key: string]: string | null };
  sessionStorage: { [key: string]: string | null };
  cookies: string;
}

export default function AuthDebugPage() {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  
  useEffect(() => {
    // Get initial auth debug state
    updateAuthState();
  }, []);
  
  const updateAuthState = () => {
    console.log('Updating auth debug state');
    const state: AuthState = {
      localStorage: {},
      sessionStorage: {},
      cookies: document.cookie,
    };

    // Get all localStorage items
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          state.localStorage[key] = localStorage.getItem(key);
        } catch (error) {
          state.localStorage[key] = 'Error reading value';
        }
      }
    }

    // Get all sessionStorage items
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        try {
          state.sessionStorage[key] = sessionStorage.getItem(key);
        } catch (error) {
          state.sessionStorage[key] = 'Error reading value';
        }
      }
    }

    setAuthState(state);
    return state;
  };
  
  const clearAllAuthData = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      // Clear all localStorage
      localStorage.clear();
      
      // Clear all sessionStorage
      sessionStorage.clear();
      
      // Clear all cookies
      document.cookie.split(';').forEach(c => {
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });
      
      const state = updateAuthState();
      setMessage('Successfully cleared all authentication data');
      
      // Show final state
      console.log('Final auth state after clearing all data:', state);
    } catch (error) {
      console.error('Error clearing auth data:', error);
      setMessage('Error clearing auth data: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };
  
  const formatValue = (value: any) => {
    if (value === null) return <span className="text-red-500">null</span>;
    if (value === undefined) return <span className="text-red-500">undefined</span>;
    if (typeof value === 'object') return <pre className="text-xs overflow-auto">{JSON.stringify(value, null, 2)}</pre>;
    if (typeof value === 'string') return <span className="text-green-500">"{value}"</span>;
    if (typeof value === 'boolean') return <span className="text-blue-500">{value.toString()}</span>;
    return <span>{String(value)}</span>;
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔧 Authentication Debug Page</h1>
        <p className="mb-6 text-gray-400">
          Use this page to debug and fix authentication issues. You can view the current auth state and clear all auth data to fix loops.
        </p>
        
        <div className="flex gap-4 my-6">
          <button
            onClick={updateAuthState}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Refresh Auth State
          </button>
          
          <button
            onClick={clearAllAuthData}
            disabled={loading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded disabled:opacity-50"
          >
            {loading ? 'Clearing...' : 'Clear All Auth Data'}
          </button>
        </div>
        
        {message && (
          <div className="my-4 p-4 bg-blue-900 bg-opacity-30 rounded">
            {message}
          </div>
        )}
        
        <h2 className="text-xl font-semibold mt-8 mb-4">Current Auth State</h2>
        {authState ? (
          <div className="bg-gray-800 rounded-lg p-4 overflow-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left pb-2 border-b border-gray-700">Property</th>
                  <th className="text-left pb-2 border-b border-gray-700">Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(authState).map(([key, value]) => (
                  <tr key={key} className="border-b border-gray-700">
                    <td className="py-2 pr-4 font-mono text-sm">{key}</td>
                    <td className="py-2 font-mono text-sm">{formatValue(value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Loading auth state...</p>
        )}
        
        <div className="mt-8 pt-4 border-t border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Navigation</h2>
          <div className="flex gap-4">
            <Link href="/" className="text-blue-400 hover:underline">
              Home
            </Link>
            <Link href="/auth" className="text-blue-400 hover:underline">
              Auth Page
            </Link>
            <Link href="/chat" className="text-blue-400 hover:underline">
              Chat
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
