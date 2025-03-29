"use client";

import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0c1220]/80 backdrop-blur-md py-4 px-6 md:px-12 shadow-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-10 flex items-center">
              {/* Using TextLogo component for consistent branding */}
              <h1 className="text-2xl md:text-3xl font-bold">
                <span className="bg-gradient-to-r from-[#9c6bff] to-[#00c8ff] bg-clip-text text-transparent">
                  SCRUVIA
                </span>
              </h1>
            </div>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="#features" className="text-gray-300 hover:text-[#00c8ff] transition-colors">
            Features
          </Link>
          <Link href="#get-started" className="text-gray-300 hover:text-[#00c8ff] transition-colors">
            Models
          </Link>
          <Link href="#products" className="text-gray-300 hover:text-[#00c8ff] transition-colors">
            Products
          </Link>
          <Link href="#contact" className="text-gray-300 hover:text-[#00c8ff] transition-colors">
            Contact
          </Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="hidden md:inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-[#9c6bff] to-[#00c8ff] hover:opacity-90 transition-colors shadow-md shadow-[#9c6bff]/20"
          >
            Get Started
          </Link>
          
          <button className="md:hidden text-gray-300 hover:text-[#00c8ff] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
