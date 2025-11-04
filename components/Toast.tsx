import React, { useEffect, useState } from 'react';
import { InfoIcon } from './icons';

interface ToastProps {
  message: string | null;
  duration?: number;
  onClear: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, duration = 4000, onClear }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: number;
    if (message) {
      setVisible(true);
      timer = window.setTimeout(() => {
        setVisible(false);
        // Allow time for fade-out animation before clearing message
        setTimeout(onClear, 300);
      }, duration);
    } else {
      setVisible(false);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [message, duration, onClear]);

  if (!message) {
      return null;
  }

  return (
    <div
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 flex items-center w-full max-w-xs p-4 space-x-4 text-gray-400 bg-base-300 rounded-lg shadow-lg transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      role="alert"
    >
      <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-blue-400 bg-blue-500/20 rounded-lg">
        <InfoIcon className="w-5 h-5" />
        <span className="sr-only">Info icon</span>
      </div>
      <div className="ms-3 text-sm font-normal text-text-secondary">{message}</div>
    </div>
  );
};
