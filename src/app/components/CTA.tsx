"use client";

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

export default function CTA() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Submit to Supabase beta_submissions table
      const { error: submissionError } = await supabase
        .from('beta_submissions')
        .insert([
          { 
            email: email,
            status: 'new',
            source: 'homepage',
            created_at: new Date().toISOString()
          }
        ]);
      
      if (submissionError) {
        console.error('Error submitting to Supabase:', submissionError);
        throw new Error(submissionError.message);
      }
      
      setIsSubmitted(true);
      setEmail('');
    } catch (err) {
      console.error('Error submitting beta signup:', err);
      setError('There was an error submitting your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <section id="contact-us" className="py-20 px-6 md:px-12">
      <div className="max-w-5xl mx-auto bg-gradient-to-r from-[#0070f3] to-[#00c8ff] rounded-3xl overflow-hidden shadow-xl">
        <div className="p-8 md:p-12 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Join the Beta for Analytics Dashboard
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Be among the first to access our powerful analytics dashboard. Get exclusive early access to advanced financial visualizations and insights tailored for tax professionals. All paid plans now include document upload capabilities!
            </p>
            
            {isSubmitted ? (
              <div className="bg-gray-900/30 p-6 rounded-lg border border-white/20 shadow-inner mb-8">
                <h3 className="text-xl font-medium mb-2">Thank You for Joining!</h3>
                <p>We've received your request to join the beta program. We'll be in touch soon with your access details.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mb-6">
                <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-6 py-3 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0070f3]/50 shadow-inner"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gray-900 text-white hover:bg-gray-800 transition-colors rounded-full font-medium shadow-lg flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Join Beta'}
                  </button>
                </div>
                
                {error && (
                  <p className="mt-2 text-red-300 text-sm">{error}</p>
                )}
              </form>
            )}
            
            <div className="mt-8 bg-gray-900/30 p-4 rounded-lg inline-block border border-white/20 shadow-inner">
              <p className="text-sm">
                <span className="font-semibold">Limited spots available!</span> Early beta users get priority support and influence future features.
              </p>
            </div>
            
            <p className="mt-4 text-sm opacity-80">
              By signing up, you agree to our <Link href="/terms-conditions" className="underline hover:text-white">Terms of Service</Link> and <Link href="/privacy-policy" className="underline hover:text-white">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
