"use client";

import Image from 'next/image';
import Link from 'next/link';
import { TypeAnimation } from 'react-type-animation';

export default function Hero() {
  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-32 px-6 md:px-12 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0c1220] via-[#0c1220] to-[#0c1220]/80 z-0"></div>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            <span className="block text-white">Your Intelligent</span>
            <span className="block">
              <TypeAnimation
                sequence={[
                  'Tax Assistant',
                  2000,
                  'Financial Advisor',
                  2000,
                  'Compliance Guide',
                  2000,
                ]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
                className="bg-gradient-to-r from-[#9c6bff] to-[#00c8ff] bg-clip-text text-transparent"
              />
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 max-w-xl">
            Experience the power of AI to simplify complex tax matters, provide instant legal insights, and transform your financial workflow.
          </p>
          
          <div className="flex mt-8">
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-[#9c6bff] to-[#00c8ff] hover:opacity-90 transition-colors shadow-lg shadow-[#9c6bff]/20"
            >
              Get Started Now
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          <div className="mt-8 p-4 bg-[#9c6bff]/10 rounded-lg border border-[#9c6bff]/20 backdrop-blur-sm">
            <p className="text-sm text-white">
              <span className="font-semibold text-[#00c8ff]">🚀 New:</span> Try our AI chatbot today and experience the future of financial management with Scruvia AI.            
            </p>
          </div>
        </div>
        
        <div className="relative flex items-center justify-center">
          <div className="w-full max-w-md relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#9c6bff] to-[#00c8ff] blur-xl opacity-30 animate-pulse"></div>
            <div className="relative bg-[#0c1220]/80 backdrop-blur-sm border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
              {/* Chat header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#9c6bff] to-[#00c8ff] flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="ml-2 text-md font-semibold text-white">Scruvia AI</h3>
                </div>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-[#9c6bff]"></div>
                  <div className="w-2 h-2 rounded-full bg-[#00c8ff]"></div>
                </div>
              </div>
              
              {/* Chat messages */}
              <div className="p-4 space-y-4 max-h-[300px] overflow-y-auto">
                {/* AI message */}
                <div className="flex items-start">
                  <div className="bg-gray-800 rounded-lg p-3 max-w-[80%]">
                    <p className="text-sm text-gray-300">Hello! I'm your AI tax assistant. How can I help you today?</p>
                  </div>
                </div>
                
                {/* User message */}
                <div className="flex items-start justify-end">
                  <div className="bg-gradient-to-r from-[#9c6bff]/20 to-[#00c8ff]/20 rounded-lg p-3 max-w-[80%]">
                    <p className="text-sm text-white">I need help with my tax deductions for my home office expenses.</p>
                  </div>
                </div>
                
                {/* AI message with typing animation */}
                <div className="flex items-start">
                  <div className="bg-gray-800 rounded-lg p-3 max-w-[80%]">
                    <p className="text-sm text-gray-300">
                      I can help with that! For home office deductions, you can claim:
                      <br/><br/>
                      1. Direct expenses (portion of rent/mortgage)
                      <br/>
                      2. Utility costs (internet, electricity)
                      <br/>
                      3. Office supplies and equipment
                      <br/><br/>
                      Would you like me to calculate potential deductions based on your specific situation?
                    </p>
                  </div>
                </div>
                
                {/* Typing indicator */}
                <div className="flex items-center space-x-1 ml-2">
                  <div className="w-2 h-2 rounded-full bg-[#9c6bff] animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-[#9c6bff] animate-pulse delay-75"></div>
                  <div className="w-2 h-2 rounded-full bg-[#9c6bff] animate-pulse delay-150"></div>
                </div>
              </div>
              
              {/* Chat input */}
              <div className="border-t border-gray-800 p-4">
                <div className="flex items-center bg-gray-800 rounded-full px-4 py-2">
                  <input type="text" placeholder="Type your question..." className="bg-transparent border-none w-full text-sm text-gray-300 focus:outline-none" disabled />
                  <button className="ml-2 p-1 rounded-full bg-gradient-to-r from-[#9c6bff] to-[#00c8ff]">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-r from-[#9c6bff]/10 to-[#00c8ff]/10 rounded-xl blur-3xl -z-10 animate-pulse-slow"></div>
        </div>
      </div>
    </section>
  );
}
