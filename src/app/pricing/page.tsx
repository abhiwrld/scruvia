"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SuccessMessage from '../components/SuccessMessage';
import PhoneVerification from '../components/PhoneVerification';

export default function PricingPage() {
  const [selectedTab, setSelectedTab] = useState('personal');
  const [currentPlan, setCurrentPlan] = useState('free');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [pendingPlanUpgrade, setPendingPlanUpgrade] = useState<string | null>(null);
  const [backButtonText, setBackButtonText] = useState('Back to Chat');
  const [backButtonUrl, setBackButtonUrl] = useState('/chat');
  const router = useRouter();
  
  useEffect(() => {
    // Get current plan from localStorage
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      if (userData.plan) {
        setCurrentPlan(userData.plan);
      }
    }
    
    // Check referrer to set appropriate back button
    if (typeof window !== 'undefined') {
      const referrer = document.referrer;
      if (referrer && (referrer.includes('/') || referrer.endsWith('.com') || referrer.endsWith('.com/'))) {
        setBackButtonText('Back to Home');
        setBackButtonUrl('/');
      }
    }
  }, []);

  const handleUpgrade = async (plan: string) => {
    setLoading(true);
    
    try {
      // Check if user is logged in by checking localStorage
      const user = localStorage.getItem('user');
      
      if (!user) {
        // User is not logged in, redirect to login
        setLoading(false);
        // Save the plan they wanted to upgrade to in localStorage
        localStorage.setItem('pendingUpgradePlan', plan);
        // Redirect to login page
        router.push('/login?returnTo=/pricing');
        return;
      }
      
      // User is logged in, proceed with upgrade
      await completeUpgrade(plan);
    } catch (err) {
      console.error('Error updating plan:', err);
      setLoading(false);
    }
  };
  
  const completeUpgrade = async (plan: string) => {
    setLoading(true);
    
    try {
      // Update user plan in localStorage
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        userData.plan = plan;
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      // Show success message and redirect after it closes
      const planNames = {
        free: 'Free',
        plus: 'Plus',
        pro: 'Pro',
        team: 'Team'
      };
      
      setSuccessMessage(`Successfully upgraded to ${planNames[plan as keyof typeof planNames]} plan! You will be redirected to the chat shortly.`);
      setShowSuccess(true);
      
      // Don't redirect immediately, the success message component will handle this
    } catch (err) {
      console.error('Error updating plan:', err);
      setLoading(false);
    }
  };
  
  const handleVerificationComplete = () => {
    setShowPhoneVerification(false);
    
    // Complete the pending plan upgrade if there is one
    if (pendingPlanUpgrade) {
      completeUpgrade(pendingPlanUpgrade);
      setPendingPlanUpgrade(null);
    }
  };
  
  const handleVerificationCancel = () => {
    setShowPhoneVerification(false);
    setPendingPlanUpgrade(null);
  };

  return (
    <div className="min-h-screen bg-[#0c1220] flex flex-col py-12 px-6 md:px-12 relative overflow-hidden">
      {/* Back navigation */}
      <div className="absolute top-4 left-4 z-10 flex space-x-4">
        <Link href="/" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Home</span>
        </Link>
        <Link href="/chat" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>Go to Chat</span>
        </Link>
      </div>
      {showSuccess && (
        <SuccessMessage
          message={successMessage}
          onClose={() => router.push('/chat')}
        />
      )}
      {showPhoneVerification && (
        <PhoneVerification
          onVerificationComplete={handleVerificationComplete}
          onCancel={handleVerificationCancel}
        />
      )}
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#9c6bff]/20 to-[#00c8ff]/20 opacity-30"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#9c6bff] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00c8ff] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
      </div>

      <div className="max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Upgrade your plan</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-4">
            Choose the perfect plan for your needs and supercharge your financial management with Scruvia AI.
          </p>
          <div className="inline-block bg-gray-800/70 px-4 py-2 rounded-lg border border-gray-700/50 mt-4">
            <p className="text-gray-300 text-sm font-medium">
              All prices are exclusive of 18% GST
            </p>
          </div>
        </div>

        {/* Tab selector */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-800/50 p-1 rounded-full backdrop-blur-sm inline-flex">
            <button
              onClick={() => setSelectedTab('personal')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedTab === 'personal'
                  ? 'bg-gradient-to-r from-[#9c6bff] to-[#00c8ff] text-white shadow-md'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Personal
            </button>
            <button
              onClick={() => setSelectedTab('business')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedTab === 'business'
                  ? 'bg-gradient-to-r from-[#9c6bff] to-[#00c8ff] text-white shadow-md'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Business
            </button>
          </div>
        </div>

        {selectedTab === 'personal' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="bg-gray-800/40 backdrop-blur-md rounded-xl overflow-hidden border border-gray-700/50 transition-all duration-300 hover:border-gray-600/70 hover:shadow-xl">
              <div className="p-8">
                <h3 className="text-xl font-semibold text-white mb-4">Free</h3>
                <div className="flex items-end mb-6">
                  <span className="text-4xl font-bold text-white">₹0</span>
                  <span className="text-gray-400 ml-2 mb-1">/month</span>
                </div>
                <p className="text-gray-300 mb-6">
                  Get started with Scruvia AI and experience the basics of AI-powered tax assistance.
                </p>
                <button
                  disabled={currentPlan === 'free' || loading}
                  onClick={() => handleUpgrade('free')}
                  className="w-full py-2 px-4 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700/50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {loading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  {currentPlan === 'free' ? 'Current Plan' : 'Downgrade to Free'}
                </button>
              </div>
              <div className="bg-gray-800/70 p-6 border-t border-gray-700/50">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-[#00c8ff] mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">10 questions per month</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-[#00c8ff] mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">Base model access</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-[#00c8ff] mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">Basic tax assistance</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Plus Plan */}
            <div className="bg-gray-800/40 backdrop-blur-md rounded-xl overflow-hidden border border-gray-700/50 transition-all duration-300 hover:border-gray-600/70 hover:shadow-xl">
              <div className="p-8">
                <h3 className="text-xl font-semibold text-white mb-4">Plus</h3>
                <div className="flex items-end mb-6">
                  <span className="text-4xl font-bold text-white">₹499</span>
                  <span className="text-gray-400 ml-2 mb-1">/month</span>
                  <span className="text-gray-500 text-xs ml-2">+GST</span>
                </div>
                <p className="text-gray-300 mb-6">
                  Ideal for individuals who need more comprehensive tax and financial assistance.
                </p>
                <button
                  disabled={currentPlan === 'plus' || loading}
                  onClick={() => handleUpgrade('plus')}
                  className="w-full py-2 px-4 bg-gradient-to-r from-[#9c6bff]/80 to-[#00c8ff]/80 hover:from-[#9c6bff] hover:to-[#00c8ff] rounded-md text-white transition-all shadow-md shadow-[#9c6bff]/20 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {loading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  {currentPlan === 'plus' ? 'Current Plan' : 'Upgrade to Plus'}
                </button>
              </div>
              <div className="bg-gray-800/70 p-6 border-t border-gray-700/50">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-[#00c8ff] mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">500 questions per month</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-[#00c8ff] mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">Base model access</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-[#00c8ff] mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">Priority support</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-[#00c8ff] mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">Document history</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-b from-gray-800/40 to-gray-800/60 backdrop-blur-md rounded-xl overflow-hidden border border-[#9c6bff]/30 transition-all duration-300 hover:border-[#9c6bff]/50 hover:shadow-xl relative">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-[#9c6bff] to-[#00c8ff] text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                POPULAR
              </div>
              <div className="p-8">
                <h3 className="text-xl font-semibold text-white mb-4">Pro</h3>
                <div className="flex items-end mb-6">
                  <span className="text-4xl font-bold text-white">₹1,999</span>
                  <span className="text-gray-400 ml-2 mb-1">/month</span>
                  <span className="text-gray-500 text-xs ml-2">+GST</span>
                </div>
                <p className="text-gray-300 mb-6">
                  Advanced AI-powered tax and financial assistance for professionals.
                </p>
                <button
                  disabled={currentPlan === 'pro' || loading}
                  onClick={() => handleUpgrade('pro')}
                  className="w-full py-2 px-4 bg-gradient-to-r from-[#9c6bff] to-[#00c8ff] hover:opacity-90 rounded-md text-white transition-all shadow-md shadow-[#9c6bff]/20 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {loading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  {currentPlan === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
                </button>
              </div>
              <div className="bg-gray-800/70 p-6 border-t border-gray-700/50">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-[#00c8ff] mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">2,000 questions per month</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-[#00c8ff] mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">Pro model access</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-[#00c8ff] mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">Priority support</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-[#00c8ff] mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">Advanced document analysis</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-[#00c8ff] mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">Custom tax templates</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {/* Business Plan */}
            <div className="bg-gradient-to-b from-gray-800/40 to-gray-800/60 backdrop-blur-md rounded-xl overflow-hidden border border-[#9c6bff]/30 transition-all duration-300 hover:border-[#9c6bff]/50 hover:shadow-xl">
              <div className="p-8">
                <h3 className="text-xl font-semibold text-white mb-4">Team</h3>
                <div className="flex items-end mb-6">
                  <span className="text-4xl font-bold text-white">₹2,499</span>
                  <span className="text-gray-400 ml-2 mb-1">/user/month</span>
                  <span className="text-gray-500 text-xs ml-2">+GST</span>
                </div>
                <p className="text-gray-300 mb-6">
                  Supercharge your team's work with a secure, collaborative workspace for tax and financial management.
                </p>
                <button
                  disabled={currentPlan === 'team' || loading}
                  onClick={() => handleUpgrade('team')}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#9c6bff] to-[#00c8ff] hover:opacity-90 rounded-md text-white transition-all shadow-md shadow-[#9c6bff]/20 text-lg font-medium disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {loading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  {currentPlan === 'team' ? 'Current Plan' : 'Get Team'}
                </button>
              </div>
              <div className="bg-gray-800/70 p-6 border-t border-gray-700/50">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-[#00c8ff] mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">5,000 questions per user per month</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-[#00c8ff] mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">Pro model access for all team members</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-[#00c8ff] mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">Collaborative workspace with shared documents</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-[#00c8ff] mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">Admin dashboard with usage analytics</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-[#00c8ff] mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">Priority support with dedicated account manager</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-[#00c8ff] mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">Advanced security features with SSO integration</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-4">All plans include our core features:</p>
          <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
            <div className="bg-gray-800/30 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-gray-300">
              AI-powered tax assistance
            </div>
            <div className="bg-gray-800/30 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-gray-300">
              Financial insights
            </div>
            <div className="bg-gray-800/30 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-gray-300">
              24/7 availability
            </div>
          </div>
          
          <p className="text-gray-400 mt-8 text-sm">
            <span className="bg-gray-800/50 px-3 py-1 rounded-md">All prices are subject to additional 18% GST</span>
          </p>
        </div>
      </div>
    </div>
  );
}
