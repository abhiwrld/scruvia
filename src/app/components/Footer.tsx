"use client";

import Link from 'next/link';
import TextLogo from './TextLogo';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer id="contact" className="bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <TextLogo />
            </Link>
            <p className="text-gray-dark mb-4">
              AI-powered chatbot for taxation and financial analytics.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Our Solutions</h3>
            <ul className="space-y-2">
              <li><Link href="/auth" target="_blank" rel="noopener noreferrer" className="text-gray-dark hover:text-primary transition-colors">Scruvia AI</Link></li>
              <li><Link href="/auth" target="_blank" rel="noopener noreferrer" className="text-gray-dark hover:text-primary transition-colors">Upgrade to Pro</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy-policy" className="text-gray-dark hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-conditions" className="text-gray-dark hover:text-primary transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/cookie-policy" className="text-gray-dark hover:text-primary transition-colors">Cookie Policy</Link></li>
              <li><Link href="/cancellations-refunds" className="text-gray-dark hover:text-primary transition-colors">Cancellations & Refunds</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-2">
              <li><Link href="/contact-us" className="text-gray-dark hover:text-primary transition-colors">Contact Us</Link></li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-[#00c8ff] mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-200">support@scruvia.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray/20">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-dark text-sm mb-4 md:mb-0">
              © {currentYear} Scruvia. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/privacy-policy" className="text-sm text-gray-dark hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-conditions" className="text-sm text-gray-dark hover:text-primary transition-colors">
                Terms & Conditions
              </Link>
              <Link href="/cookie-policy" className="text-sm text-gray-dark hover:text-primary transition-colors">
                Cookie Policy
              </Link>
              <Link href="/contact-us" className="text-sm text-gray-dark hover:text-primary transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
