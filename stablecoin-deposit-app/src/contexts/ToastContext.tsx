import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer, ToastType, ToastAction } from '../components/Toast';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  action?: ToastAction;
}

interface ToastOptions {
  type?: ToastType;
  action?: ToastAction;
}

interface ToastContextType {
  showToast: (message: string, options?: ToastOptions | ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, options?: ToastOptions | ToastType) => {
    const id = Date.now().toString();
    
    // Handle both old API (just type string) and new API (options object)
    if (typeof options === 'string') {
      setToasts((prev) => [...prev, { id, message, type: options }]);
    } else {
      const { type = 'success', action } = options || {};
      setToasts((prev) => [...prev, { id, message, type, action }]);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};