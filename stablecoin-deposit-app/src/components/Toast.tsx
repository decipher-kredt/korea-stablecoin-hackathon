import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, X, ExternalLink } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  action?: ToastAction;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, action, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 6000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="toast-icon" size={20} />;
      case 'error':
        return <XCircle className="toast-icon" size={20} />;
      case 'info':
        return <AlertCircle className="toast-icon" size={20} />;
    }
  };

  const handleAction = () => {
    if (action?.href) {
      window.open(action.href, '_blank', 'noopener,noreferrer');
    } else if (action?.onClick) {
      action.onClick();
    }
  };

  return (
    <motion.div
      className={`toast toast-${type}`}
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.5 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      layout
    >
      {getIcon()}
      <span className="toast-message">{message}</span>
      {action && (
        <button
          className="toast-action"
          onClick={handleAction}
          aria-label={action.label}
        >
          <ExternalLink size={16} />
          <span>{action.label}</span>
        </button>
      )}
      <button 
        className="toast-close" 
        onClick={() => onClose(id)}
        aria-label="닫기"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    message: string;
    type: ToastType;
    action?: ToastAction;
  }>;
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            action={toast.action}
            onClose={onClose}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};