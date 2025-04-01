"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { debugAuthState, resetAuthState, refreshSession, supabase } from '@/utils/supabase';
import { useAuth } from '@/context/AuthContext';

type AuthState = {
  pendingLogin: string | null;
  session: any;
  user: any;
  hasLocalSession: boolean;
};

export default function AuthDebugPage() {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [subscriptionResults, setSubscriptionResults] = useState<any>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    updateAuthState();
  }, []);

  const updateAuthState = async () => {
    setLoading(true);
    try {
      const state = await debugAuthState();
      setAuthState(state as AuthState);
    } catch (error) {
      console.error('Error getting auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetAuth = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const success = await resetAuthState();
      
      if (success) {
        setMessage('Authentication state has been reset successfully');
        // Reload page after reset
        window.location.reload();
      } else {
        setMessage('Failed to reset authentication state');
      }
    } catch (error) {
      console.error('Error resetting auth:', error);
      setMessage('Error: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshSession = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const success = await refreshSession();
      
      if (success) {
        setMessage('Session refreshed successfully');
        // Update auth state to show changes
        updateAuthState();
      } else {
        setMessage('Failed to refresh session');
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      setMessage('Error: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  const checkSubscription = async () => {
    setLoading(true);
    setMessage('');
    
    if (!user) {
      setMessage('No user logged in to check subscription');
      setLoading(false);
      return;
    }
    
    try {
      // Try direct Postgres API call with proper headers
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/subscriptions?select=*&user_id=eq.${user.id}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`
          }
        }
      );
      
      const data = await response.json();
      setSubscriptionResults({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers.entries()]),
        data
      });
      
      if (!response.ok) {
        setMessage(`API Error: ${response.status} ${response.statusText}`);
      } else {
        setMessage('Subscription API check completed successfully');
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setMessage('Error: ' + (error instanceof Error ? error.message : String(error)));
      setSubscriptionResults({ error: String(error) });
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
    <div className="min-h-screen bg-[#0c1220] p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          <span className="bg-gradient-to-r from-[#9c6bff] to-[#00c8ff] bg-clip-text text-transparent">
            Auth Debugging
          </span>
        </h1>
        
        {message && (
          <div className={`mb-6 p-4 rounded-md ${message.includes('Error') ? 'bg-red-900/50 border border-red-500/50' : 'bg-green-900/50 border border-green-500/50'}`}>
            <p className="text-white">{message}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={updateAuthState}
            disabled={loading}
            className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-md"
          >
            {loading ? 'Loading...' : 'Refresh Auth State'}
          </button>
          
          <button
            onClick={handleRefreshSession}
            disabled={loading}
            className="bg-blue-800 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
          >
            {loading ? 'Loading...' : 'Refresh Session Token'}
          </button>
          
          <button
            onClick={checkSubscription}
            disabled={loading || !user}
            className="bg-violet-800 hover:bg-violet-700 text-white py-2 px-4 rounded-md"
          >
            {loading ? 'Loading...' : 'Check Subscription API'}
          </button>
          
          <button
            onClick={handleResetAuth}
            disabled={loading}
            className="bg-red-800 hover:bg-red-700 text-white py-2 px-4 rounded-md"
          >
            {loading ? 'Loading...' : 'Reset Auth State'}
          </button>
        </div>
        
        <Link href="/" className="inline-block mb-8 text-[#00c8ff] hover:text-[#9c6bff]">
          ← Back to Home
        </Link>
        
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Auth State</h2>
          {authState ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-md font-medium text-gray-300 mb-1">User</h3>
                <div className="bg-gray-900/50 p-3 rounded">
                  {formatValue(authState.user)}
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-gray-300 mb-1">Session</h3>
                <div className="bg-gray-900/50 p-3 rounded">
                  {formatValue(authState.session)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-md font-medium text-gray-300 mb-1">Pending Login</h3>
                  <div className="bg-gray-900/50 p-3 rounded">
                    {formatValue(authState.pendingLogin)}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-medium text-gray-300 mb-1">Local Session</h3>
                  <div className="bg-gray-900/50 p-3 rounded">
                    {formatValue(authState.hasLocalSession)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Loading auth state...</p>
          )}
        </div>
        
        {subscriptionResults && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Subscription API Results</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-md font-medium text-gray-300 mb-1">Status</h3>
                <div className="bg-gray-900/50 p-3 rounded">
                  {subscriptionResults.status} {subscriptionResults.statusText}
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-gray-300 mb-1">Headers</h3>
                <div className="bg-gray-900/50 p-3 rounded">
                  {formatValue(subscriptionResults.headers)}
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-gray-300 mb-1">Data</h3>
                <div className="bg-gray-900/50 p-3 rounded">
                  {formatValue(subscriptionResults.data)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
