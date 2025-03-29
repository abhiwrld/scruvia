"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AuthHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [questionsRemaining, setQuestionsRemaining] = useState(10); // Default for free plan
  const router = useRouter();

  useEffect(() => {
    // Get user profile from localStorage
    if (typeof window !== 'undefined') {
      try {
        const profileStr = localStorage.getItem('user');
        if (profileStr) {
          const profile = JSON.parse(profileStr);
          setUserProfile(profile);
          
          // Calculate questions remaining based on plan
          const questionsUsed = profile.questions_used || 0;
          let totalQuestions = 10; // free plan
          
          if (profile.plan === 'plus') {
            totalQuestions = 500;
          } else if (profile.plan === 'pro') {
            totalQuestions = 2000;
          } else if (profile.plan === 'team') {
            totalQuestions = 5000;
          }
          
          setQuestionsRemaining(Math.max(0, totalQuestions - questionsUsed));
        }
      } catch (error) {
        console.error('Error parsing user profile:', error);
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      console.log('Logging out user');
      
      // Clear user data from localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('authenticated');
      
      console.log('Logout successful, redirecting to login page');
      
      // Redirect to login page
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0c1220] py-4 px-6 md:px-12 shadow-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/chat" className="flex items-center gap-2">
            <div className="relative h-10 flex items-center">
              <h1 className="text-2xl md:text-3xl font-bold">
                <span className="bg-gradient-to-r from-[#9c6bff] to-[#00c8ff] bg-clip-text text-transparent">
                  SCRUVIA
                </span>
              </h1>
            </div>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/chat" className="text-gray-300 hover:text-[#00c8ff] transition-colors">
            Chat
          </Link>
          <Link href="/pricing" className="text-gray-300 hover:text-[#00c8ff] transition-colors">
            Pricing
          </Link>
          {userProfile?.plan !== 'free' && (
            <Link href="/analytics" className="text-gray-300 hover:text-[#00c8ff] transition-colors">
              Analytics
            </Link>
          )}
        </nav>
        
        <div className="flex items-center gap-4 relative">
          {/* Plan info */}
          {userProfile && (
            <div className="hidden md:flex items-center mr-2 text-sm text-gray-300">
              <span className="bg-gray-800/70 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-700/50">
                {/* Display plan with fallback to Free Plan */}
                {(userProfile?.plan === 'plus' && 'Plus Plan') ||
                 (userProfile?.plan === 'pro' && 'Pro Plan') ||
                 (userProfile?.plan === 'team' && 'Team Plan') ||
                 'Free Plan'}
                <span className="ml-2 text-xs px-2 py-0.5 bg-gray-700/70 rounded-full">
                  {questionsRemaining} Q left
                </span>
              </span>
            </div>
          )}
          <Link 
            href="/pricing"
            className="flex items-center justify-center px-4 py-2 rounded-full text-white bg-gradient-to-r from-[#9c6bff] to-[#00c8ff] hover:opacity-90 transition-all shadow-md shadow-[#9c6bff]/20 text-sm font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Upgrade Plan
          </Link>
          
          {userProfile ? (
            <>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-[#9c6bff] to-[#00c8ff] rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden md:inline-block">{userProfile?.name || 'User'}</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-4 w-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-700">
                  <Link 
                    href="/profile" 
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Your Profile
                  </Link>
                  <Link 
                    href="/pricing" 
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Upgrade Plan
                  </Link>
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-[#9c6bff] to-[#00c8ff] hover:opacity-90 transition-colors shadow-md shadow-[#9c6bff]/20"
            >
              Sign In
            </Link>
          )}
          
          <button 
            className="md:hidden text-gray-300 hover:text-[#00c8ff] transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 bg-gray-800/90 rounded-md">
          <Link 
            href="/chat" 
            className="block px-4 py-2 text-base text-gray-300 hover:bg-gray-700 hover:text-white"
            onClick={() => setIsMenuOpen(false)}
          >
            Chat
          </Link>
          <Link 
            href="/pricing" 
            className="block px-4 py-2 text-base text-gray-300 hover:bg-gray-700 hover:text-white"
            onClick={() => setIsMenuOpen(false)}
          >
            Pricing
          </Link>
          {userProfile?.plan !== 'free' && (
            <Link 
              href="/analytics" 
              className="block px-4 py-2 text-base text-gray-300 hover:bg-gray-700 hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              Analytics
            </Link>
          )}
          {userProfile && (
            <>
              <Link 
                href="/profile" 
                className="block px-4 py-2 text-base text-gray-300 hover:bg-gray-700 hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Your Profile
              </Link>
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="block w-full text-left px-4 py-2 text-base text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
