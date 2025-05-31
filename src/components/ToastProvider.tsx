import { useState, ReactNode, useCallback } from 'react'; // Removed createContext, useContext
import Toast from './Toast'; // Kept ToastType via Toast import
import { AnimatePresence } from 'framer-motion';
import { ToastContext, ToastMessage as ToastItemType, ToastType } from '@/hooks/useToast'; // Import new context and types

// Interface ToastItem removed as ToastItemType from hook will be used.
// Interface ToastContextType removed as it's defined in the hook.
// const ToastContext removed as it's imported.
// export function useToast() removed as it's imported from the hook.

interface ToastProviderProps {
  children: ReactNode;
}

export default function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItemType[]>([]); // Use ToastItemType
  
  const addToast = useCallback((message: string, type: ToastType, duration: number = 5000) => {
    const id = crypto.randomUUID(); // Use crypto.randomUUID for better ID generation
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    
    // Auto-remove toast after specified duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []); // Added useCallback and dependencies
  
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []); // Added useCallback
  
  return (
    <ToastContext.Provider value={{ addToast, removeToast }}> {/* Provide addToast and removeToast */}
      {children}
      
      {/* Toast container positioned at the top center */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto max-w-md w-full">
              <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => removeToast(toast.id)}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
} 