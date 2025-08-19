import React from 'react';
import { Clock, LogOut } from 'lucide-react';
import './InactivityModal.css';

interface InactivityModalProps {
  isOpen: boolean;
  type: 'warning' | 'logout';
  onClose?: () => void;
  countdown?: number;
}

const InactivityModal: React.FC<InactivityModalProps> = ({ 
  isOpen, 
  type, 
  onClose, 
  countdown 
}) => {
  if (!isOpen) return null;

  if (type === 'warning') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Inactivity Warning
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                You will be automatically logged out in <span className="font-semibold text-yellow-600">{countdown || 60}</span> seconds due to inactivity.
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Move your mouse, scroll, or press any key to stay logged in.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'logout') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <LogOut className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Session Expired
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                You have been logged out due to inactivity. Please log in again to continue.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default InactivityModal;
