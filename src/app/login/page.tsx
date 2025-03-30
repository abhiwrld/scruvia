"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showTroubleshooter, setShowTroubleshooter] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const router = useRouter();
  const { user, signIn, isLoading } = useAuth();

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      router.push('/chat');
    }
  }, [user, router]);

  useEffect(() => {
    // Show troubleshooter if user is stuck on login page
    let timer: NodeJS.Timeout;
    const pendingLogin = localStorage.getItem('userLoginPending');
    
    if (pendingLogin === 'true') {
      timer = setTimeout(() => {
        setShowTroubleshooter(true);
      }, 3000);
    }
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Add effect to check if user is actually signed in but page didn't redirect
  useEffect(() => {
    const checkActualAuthState = async () => {
      try {
        // Only run this check after a short delay to avoid unnecessary work
        setTimeout(async () => {
          const { debugAuthState } = await import('@/utils/supabase');
          const authState = await debugAuthState();
          
          // If user appears to be logged in but UI doesn't reflect that
          if (authState.session && !user) {
            console.log('User seems to be logged in but UI doesn\'t reflect that');
            setShowTroubleshooter(true);
          }
        }, 2000);
      } catch (error) {
        console.error('Error checking actual auth state:', error);
      }
    };
    
    checkActualAuthState();
  }, [user]);

  // Check if login was successful but user is stuck on login page
  useEffect(() => {
    // If handleLogin completed successfully but we're still on login page
    if (loginSuccess) {
      const timer = setTimeout(() => {
        setShowTroubleshooter(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [loginSuccess]);

  // Add code to detect what's clearing localStorage
  useEffect(() => {
    console.log('Login page loaded, monitoring localStorage');
    
    // Add detection for localStorage clearing
    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;
    const originalClear = localStorage.clear;
    
    // Override localStorage methods to detect what's clearing items
    localStorage.setItem = function(key, value) {
      console.log('Setting localStorage item:', key);
      originalSetItem.call(localStorage, key, value);
    };
    
    localStorage.removeItem = function(key) {
      console.log('Removing localStorage item:', key);
      originalRemoveItem.call(localStorage, key);
    };
    
    localStorage.clear = function() {
      console.log('Clearing localStorage - STACK TRACE:', new Error().stack);
      originalClear.call(localStorage);
    };
    
    return () => {
      // Restore original methods when component unmounts
      localStorage.setItem = originalSetItem;
      localStorage.removeItem = originalRemoveItem;
      localStorage.clear = originalClear;
    };
  }, []);

  const handleForceChatRedirect = () => {
    if (typeof window !== 'undefined') {
      // Ensure we have userLoginPending set
      localStorage.setItem('userLoginPending', 'true');
      // Force redirect to chat page
      window.location.href = `${window.location.origin}/chat`;
    }
  };

  const handleEmergencyRedirect = () => {
    window.location.href = `${window.location.origin}/chat`;
  };

  // Direct login without relying on localStorage
  const handleDirectLogin = async () => {
    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Create a form for direct submission
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '/api/auth/login-redirect';
      form.style.display = 'none';
      
      // Add email field
      const emailField = document.createElement('input');
      emailField.type = 'hidden';
      emailField.name = 'email';
      emailField.value = email;
      form.appendChild(emailField);
      
      // Add password field
      const passwordField = document.createElement('input');
      passwordField.type = 'hidden';
      passwordField.name = 'password';
      passwordField.value = password;
      form.appendChild(passwordField);
      
      // Add remember me field
      const rememberField = document.createElement('input');
      rememberField.type = 'hidden';
      rememberField.name = 'remember';
      rememberField.value = rememberMe ? 'true' : 'false';
      form.appendChild(rememberField);
      
      // Add to body and submit
      document.body.appendChild(form);
      
      // Indicate success to user
      setLoginSuccess(true);
      
      // Try the original login method first for backward compatibility
      try {
        await signIn(email, password, rememberMe);
        console.log('Login successful via signIn method');
        
        // If login succeeded but we're still here after 2 seconds, submit the form
        setTimeout(() => {
          if (document.body.contains(form)) {
            console.log('Still on login page, trying direct form submission');
            form.submit();
          }
        }, 2000);
      } catch (err) {
        console.error('signIn method failed, using direct form submission', err);
        form.submit();
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowTroubleshooter(false);

    if (!email || !password) {
      setError('Please enter your email and password');
      setLoading(false);
      return;
    }

    try {
      // Sign in with Supabase - this will trigger the onAuthStateChange handler
      // which will redirect to chat page directly
      await signIn(email, password, rememberMe);
      console.log('Login successful - waiting for auth state change to redirect');
      
      // Mark login as successful so we can show emergency button if needed
      setLoginSuccess(true);
      
      // The redirect will be handled by the Auth context onAuthStateChange handler
      // No need for complex redirect logic here
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0c1220] flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00c8ff]"></div>
        <p className="mt-4 text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c1220] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold">
          <span className="bg-gradient-to-r from-[#9c6bff] to-[#00c8ff] bg-clip-text text-transparent">
            SCRUVIA
          </span>
        </h1>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Or{' '}
          <Link href="/signup" className="font-medium text-[#00c8ff] hover:text-[#9c6bff]">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800/40 backdrop-blur-md py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-700/50">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-md text-white text-sm">
              {error}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={(e) => {
            e.preventDefault();
            handleDirectLogin();
          }}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#00c8ff] focus:border-[#00c8ff] sm:text-sm bg-gray-900/50 text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#00c8ff] focus:border-[#00c8ff] sm:text-sm bg-gray-900/50 text-white pr-10"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-[#00c8ff] focus:ring-[#00c8ff] border-gray-700 rounded bg-gray-900/50"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-[#00c8ff] hover:text-[#9c6bff]">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#9c6bff] to-[#00c8ff] hover:from-[#8a5aef] hover:to-[#00b7ef] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00c8ff] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading || isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
            
            {/* Manual Login Form */}
            <div className="text-center mt-4">
              <p className="text-sm text-gray-400 mb-2">If the standard login doesn't work:</p>
              <button
                type="button"
                onClick={() => {
                  // Create and submit a manual form to the server
                  const form = document.createElement('form');
                  form.method = 'POST';
                  form.action = '/api/auth/login-redirect';
                  
                  const emailInput = document.createElement('input');
                  emailInput.type = 'hidden';
                  emailInput.name = 'email';
                  emailInput.value = email;
                  form.appendChild(emailInput);
                  
                  const passwordInput = document.createElement('input');
                  passwordInput.type = 'hidden';
                  passwordInput.name = 'password';
                  passwordInput.value = password;
                  form.appendChild(passwordInput);
                  
                  const rememberInput = document.createElement('input');
                  rememberInput.type = 'hidden';
                  rememberInput.name = 'remember';
                  rememberInput.value = rememberMe ? 'true' : 'false';
                  form.appendChild(rememberInput);
                  
                  document.body.appendChild(form);
                  form.submit();
                }}
                className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded transition-colors"
              >
                Use Alternative Login Method
              </button>
            </div>
            
            {/* Login Troubleshooter */}
            {showTroubleshooter && (
              <div className="mt-4 p-3 border border-yellow-500/30 bg-yellow-500/10 rounded-md">
                <p className="text-sm text-yellow-300 mb-2">
                  Having trouble logging in? We detected you're signed in but the page isn't redirecting.
                </p>
                <button
                  type="button"
                  onClick={handleEmergencyRedirect}
                  className="text-sm w-full py-2 px-4 bg-yellow-600/30 hover:bg-yellow-600/50 border border-yellow-600/50 rounded text-yellow-200 transition-colors"
                >
                  Continue to Chat
                </button>
              </div>
            )}
          </form>
          
          {/* Emergency button after successful login */}
          {loginSuccess && (
            <div className="mt-8 border-t border-gray-700 pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-3">
                  If you're not automatically redirected:
                </p>
                <button
                  onClick={handleEmergencyRedirect}
                  className="w-full py-3 px-4 bg-red-800 hover:bg-red-700 text-white font-bold rounded transition-colors"
                >
                  EMERGENCY REDIRECT TO CHAT
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  You've successfully logged in but the automatic redirect didn't work
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* No-JavaScript fallback form */}
      <noscript>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-gray-800/40 backdrop-blur-md py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-700/50">
            <form action="/api/auth/login-redirect" method="POST" className="space-y-6">
              <div className="text-white text-center mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-md">
                JavaScript is disabled. Please use this form to log in.
              </div>
              <div>
                <label htmlFor="email-noscript" className="block text-sm font-medium text-gray-300">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email-noscript"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#00c8ff] focus:border-[#00c8ff] sm:text-sm bg-gray-900/50 text-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password-noscript" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password-noscript"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#00c8ff] focus:border-[#00c8ff] sm:text-sm bg-gray-900/50 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me-noscript"
                  name="remember"
                  type="checkbox"
                  value="true"
                  className="h-4 w-4 text-[#00c8ff] focus:ring-[#00c8ff] border-gray-700 rounded bg-gray-900/50"
                />
                <label htmlFor="remember-me-noscript" className="ml-2 block text-sm text-gray-300">
                  Remember me
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#9c6bff] to-[#00c8ff] hover:from-[#8a5aef] hover:to-[#00b7ef] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00c8ff]"
                >
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      </noscript>
    </div>
  );
}
