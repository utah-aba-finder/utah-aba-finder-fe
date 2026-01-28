import React, { useEffect, useRef } from 'react';

interface TawkToWidgetProps {
  widgetId?: string; // Made optional since script is loaded in index.html
  visitorName?: string;
  visitorEmail?: string;
  onLoad?: () => void;
  onStatusChange?: (status: string) => void;
}

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}

/**
 * TawkToWidget - Lightweight React wrapper for Tawk.to
 * 
 * Note: The Tawk.to script is loaded directly in index.html to prevent
 * React hydration conflicts. This component only handles:
 * - Setting up API callbacks (onLoad, onStatusChange)
 * - Setting visitor information
 * - Error handling for i18next issues
 */
const TawkToWidget: React.FC<TawkToWidgetProps> = ({
  visitorName,
  visitorEmail,
  onLoad,
  onStatusChange,
}) => {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;

    // Wait for Tawk.to to be available (script loaded in index.html)
    const checkTawkReady = setInterval(() => {
      if (typeof window !== 'undefined' && window.Tawk_API) {
        clearInterval(checkTawkReady);
        
        try {
          // Set up error handling for i18next
          window.Tawk_API.onLoad = function() {
            try {
              // Override problematic i18next function
              if (window.Tawk_API && window.Tawk_API.$_Tawk) {
                // Create a safe wrapper for i18next
                if (!window.Tawk_API.$_Tawk.i18next || typeof window.Tawk_API.$_Tawk.i18next !== 'function') {
                  window.Tawk_API.$_Tawk.i18next = function() {
                    return {
                      t: function(key: string) { return key; },
                      language: 'en'
                    };
                  };
                }

                // Override setVisitorInformation to avoid i18next issues
                if (window.Tawk_API.$_Tawk.setVisitorInformation) {
                  const originalSetVisitorInformation = window.Tawk_API.$_Tawk.setVisitorInformation;
                  window.Tawk_API.$_Tawk.setVisitorInformation = function(name: string, email: string) {
                    try {
                      return originalSetVisitorInformation.call(this, name, email);
                    } catch (error) {
                      // Silently handle errors
                    }
                  };
                }
              }

              onLoad?.();
            } catch (error) {
              // Silently handle errors
            }
          };

          window.Tawk_API.onStatusChange = function(status: string) {
            try {
              onStatusChange?.(status);
            } catch (error) {
              // Silently handle errors
            }
          };

          isInitialized.current = true;
        } catch (error) {
          // Silently handle errors
        }
      }
    }, 100);

    // Timeout after 10 seconds if Tawk.to never loads
    const timeout = setTimeout(() => {
      clearInterval(checkTawkReady);
    }, 10000);

    return () => {
      clearInterval(checkTawkReady);
      clearTimeout(timeout);
    };
  }, [onLoad, onStatusChange]);

  // Set visitor information when props change
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Tawk_API && (visitorName || visitorEmail)) {
      try {
        window.Tawk_API.setVisitorInformation?.(visitorName || '', visitorEmail || '');
      } catch (error) {
        // Silently handle errors
      }
    }
  }, [visitorName, visitorEmail]);

  return null; // This component doesn't render anything
};

export default TawkToWidget; 