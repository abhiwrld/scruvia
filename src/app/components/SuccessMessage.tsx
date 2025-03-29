"use client";

import { useEffect, useState } from 'react';

type SuccessMessageProps = {
  message: string;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseTime?: number;
};

export default function SuccessMessage({ 
  message, 
  onClose, 
  autoClose = true, 
  autoCloseTime = 5000 
}: SuccessMessageProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (autoClose) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - (100 / (autoCloseTime / 100));
          return newProgress < 0 ? 0 : newProgress;
        });
      }, 100);

      const timeout = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, autoCloseTime);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [autoClose, autoCloseTime, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full animate-fade-in">
      <div className="bg-gray-800/90 backdrop-blur-md border border-green-500/30 rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 flex items-start">
          <div className="flex-shrink-0 mr-3">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-white">Success!</h3>
            <p className="mt-1 text-sm text-gray-300">{message}</p>
          </div>
          <button 
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="flex-shrink-0 ml-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {autoClose && (
          <div className="h-1 bg-gray-700">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Add animations to globals.css
// .animate-fade-in {
//   animation: fadeIn 0.3s ease-in-out;
// }
// 
// @keyframes fadeIn {
//   from {
//     opacity: 0;
//     transform: translateY(-20px);
//   }
//   to {
//     opacity: 1;
//     transform: translateY(0);
//   }
// }
