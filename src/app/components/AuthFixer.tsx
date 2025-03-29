"use client";

import { useState } from 'react';

export default function AuthFixer() {
  const [message, setMessage] = useState('');
  
  const cleanAuth = async () => {
    try {
      setMessage('Cleaning authentication data...');
      
      // Clear all sessionStorage
      sessionStorage.clear();
      
      // Clear auth-related localStorage
      localStorage.removeItem('authenticated');
      localStorage.removeItem('auth_successful');
      localStorage.removeItem('auth_user_id');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('user');
      
      // Clear cookies
      document.cookie.split(';').forEach(c => {
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });
      
      setMessage('Authentication data cleaned. Try reloading the page.');
      
      // Add reload button after 2 seconds
      setTimeout(() => {
        setMessage('Authentication data cleaned. <button onClick="window.location.reload()" class="underline text-blue-400">Reload page</button>');
      }, 2000);
      
      // Force reload after 5 seconds
      setTimeout(() => {
        window.location.reload();
      }, 5000);
      
    } catch (error) {
      setMessage('Error cleaning auth: ' + (error instanceof Error ? error.message : String(error)));
    }
  };
  
  return (
    <div className="fixed bottom-5 right-5 z-50">
      <div className="bg-red-800 p-4 rounded-lg shadow-lg text-white max-w-xs">
        <h3 className="font-bold mb-2">Authentication Issues?</h3>
        <p className="text-sm mb-3">If you're experiencing redirect loops or authentication problems, click below to fix.</p>
        
        <button 
          onClick={cleanAuth}
          className="w-full bg-white text-red-800 py-2 px-4 rounded-md font-medium hover:bg-red-100"
        >
          Reset Auth Data
        </button>
        
        {message && (
          <div className="mt-2 text-sm" dangerouslySetInnerHTML={{ __html: message }}></div>
        )}
      </div>
    </div>
  );
}
