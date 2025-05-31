import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ToastType } from '@/hooks/useToast'; // Import ToastType from hook

// Removed local ToastType definition

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeout(onClose, 300); // Allow time for exit animation
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  const getTypeClasses = () => {
    // Base classes for all toasts: dark, slightly transparent background for shimmer to show through
    // The shimmer itself will be the main visual, border-l provides type color cue.
    let baseClasses = 'bg-gray-900/70 backdrop-blur-sm shadow-xl text-gray-100 border border-gray-700/50';
    let accentBorder = '';

    switch (type) {
      case 'success':
        accentBorder = 'border-l-4 border-green-500';
        break;
      case 'error':
        accentBorder = 'border-l-4 border-red-500';
        break;
      case 'info':
        accentBorder = 'border-l-4 border-blue-500';
        break;
      case 'warning':
        accentBorder = 'border-l-4 border-yellow-500';
        break;
      default:
        accentBorder = 'border-l-4 border-gray-500';
        break;
    }
    return `${baseClasses} ${accentBorder}`;
  };
  
  const getIcon = () => {
    switch (type) {
      case 'success':
        return ( // Green icon
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(74 222 128)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        );
      case 'error':
        return ( // Red icon
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(248 113 113)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        );
      case 'info':
        return ( // Blue icon
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(96 165 250)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        );
      case 'warning':
        return ( // Yellow/Orange icon
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(251 146 60)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        );
      default:
        return null; // Should not happen
    }
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`toast-shimmer flex items-center px-4 py-3 rounded-xl w-full ${getTypeClasses()}`} // Added toast-shimmer, adjusted rounded-xl
    >
      {/* Content now wrapped in a div to be above the shimmer pseudo-element */}
      <div className="flex items-center w-full">
        <div className="mr-3 flex-shrink-0">
          {getIcon()}
        </div>
        <div className="mr-4 font-medium flex-grow">{message}</div>
        <button
          onClick={() => {
            setTimeout(onClose, 300); // Keep delay for exit animation
          }}
          className="ml-auto flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Close notification"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </motion.div>
  );
}