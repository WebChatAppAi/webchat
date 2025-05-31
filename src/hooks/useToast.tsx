'use client';

import { createContext, useContext, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  // Define showToast here based on addToast for a simpler API if desired
  // This makes it consistent with how it was called in SettingsModal
  const showToast = useCallback((message: string, type: ToastType, duration?: number) => {
    context.addToast(message, type, duration);
  }, [context]);

  return { ...context, showToast }; // Return original context and the new showToast
};