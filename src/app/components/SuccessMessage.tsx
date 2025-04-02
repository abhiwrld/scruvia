"use client";

import { useEffect, useState } from 'react';
import FullScreenModal from './FullScreenModal';

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
  return (
    <FullScreenModal
      title="Success!"
      message={message}
      type="success"
      onClose={onClose}
      buttonText="Continue"
      autoClose={autoClose}
      autoCloseTime={autoCloseTime}
    />
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
