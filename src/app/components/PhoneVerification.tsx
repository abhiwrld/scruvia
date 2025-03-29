"use client";

import { useState } from 'react';

interface PhoneVerificationProps {
  onVerificationComplete: () => void;
  onCancel: () => void;
}

export default function PhoneVerification({ onVerificationComplete, onCancel }: PhoneVerificationProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Format phone number as user types
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all non-digit characters
    const digits = e.target.value.replace(/\D/g, '');
    
    // Format the phone number (US format as an example)
    if (digits.length <= 3) {
      setPhoneNumber(digits);
    } else if (digits.length <= 6) {
      setPhoneNumber(`${digits.slice(0, 3)}-${digits.slice(3)}`);
    } else {
      setPhoneNumber(`${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`);
    }
  };

  // Send verification code
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // For demo purposes, we'll just move to the code verification step
      // In a real app, you would send an actual verification code
      setStep('code');
    } catch (error: any) {
      setError(error.message || 'Failed to send verification code');
      console.error('Error sending verification code:', error);
    } finally {
      setLoading(false);
    }
  };

  // Verify code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // For demo purposes, we'll accept any code
      // In a real app, you would verify the code against your backend
      onVerificationComplete();
    } catch (error: any) {
      setError(error.message || 'Failed to verify code');
      console.error('Error verifying code:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {step === 'phone' ? 'Verify Your Phone Number' : 'Enter Verification Code'}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {step === 'phone' ? (
          <>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              To upgrade your plan, we need to verify your phone number. We'll send you a verification code via SMS.
            </p>
            
            <form onSubmit={handleSendCode}>
              <div className="mb-4">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  placeholder="(555) 555-5555"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00c8ff] focus:ring-[#00c8ff] sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00c8ff] dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#00c8ff] border border-transparent rounded-md hover:bg-[#00b7ef] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00c8ff] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Code'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Please enter the verification code sent to your phone.
            </p>
            
            <form onSubmit={handleVerifyCode}>
              <div className="mb-4">
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00c8ff] focus:ring-[#00c8ff] sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00c8ff] dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#00c8ff] border border-transparent rounded-md hover:bg-[#00b7ef] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00c8ff] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
