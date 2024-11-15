import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  
  

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Close after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="toast">
      <div className="toast-content">
        <span>{message}</span>
        <button className="toast-close" onClick={onClose}>×</button>
      </div>
      <style jsx>{`
        .toast {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background-color: #333;
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          z-index: 9999;
          opacity: 1;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .toast-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .toast-close {
          background: none;
          border: none;
          color: white;
          font-size: 16px;
          cursor: pointer;
        }
        .toast:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
};

export default Toast;
