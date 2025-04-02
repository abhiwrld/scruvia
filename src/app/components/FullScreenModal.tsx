"use client";

import { useEffect, useState } from 'react';

interface FullScreenModalProps {
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  buttonText?: string;
  autoClose?: boolean;
  autoCloseTime?: number;
}

export default function FullScreenModal({
  title,
  message,
  type,
  onClose,
  buttonText = 'Continue',
  autoClose = false,
  autoCloseTime = 5000
}: FullScreenModalProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  // Handle keyboard escape
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  // Auto close timer
  useEffect(() => {
    if (autoClose) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - (100 / (autoCloseTime / 100));
          return newProgress < 0 ? 0 : newProgress;
        });
      }, 100);

      const timeout = setTimeout(() => {
        handleClose();
      }, autoCloseTime);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [autoClose, autoCloseTime]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  if (!isVisible) return null;

  // Define icon based on type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="h-16 w-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case 'info':
      default:
        return (
          <div className="h-16 w-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  // Define background and accent colors based on type
  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'from-green-600/10 to-green-500/5',
          border: 'border-green-500/30',
          button: 'bg-gradient-to-r from-green-600 to-green-500',
          progress: 'from-green-600 to-green-500'
        };
      case 'error':
        return {
          bg: 'from-red-600/10 to-red-500/5',
          border: 'border-red-500/30',
          button: 'bg-gradient-to-r from-red-600 to-red-500',
          progress: 'from-red-600 to-red-500'
        };
      case 'warning':
        return {
          bg: 'from-yellow-600/10 to-yellow-500/5',
          border: 'border-yellow-500/30',
          button: 'bg-gradient-to-r from-yellow-600 to-yellow-500',
          progress: 'from-yellow-600 to-yellow-500'
        };
      case 'info':
      default:
        return {
          bg: 'from-blue-600/10 to-blue-500/5',
          border: 'border-blue-500/30',
          button: 'bg-gradient-to-r from-blue-600 to-blue-500',
          progress: 'from-blue-600 to-blue-500'
        };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in overflow-hidden">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose}></div>
      
      <div className={`relative w-full max-w-lg p-8 mx-4 rounded-xl border ${colors.border} bg-gradient-to-b ${colors.bg} backdrop-blur-lg shadow-2xl`}>
        {getIcon()}
        
        <h2 className="text-2xl font-bold text-white text-center mb-4">{title}</h2>
        
        <div className="text-gray-200 text-center mb-8 whitespace-pre-wrap">
          {message}
        </div>
        
        <button
          onClick={handleClose}
          className={`w-full py-3 px-4 rounded-lg text-white ${colors.button} hover:opacity-90 transition-all font-medium`}
        >
          {buttonText}
        </button>
        
        {autoClose && (
          <div className="h-1 bg-gray-800/50 mt-6 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${colors.progress} transition-all duration-100 ease-linear`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
} 