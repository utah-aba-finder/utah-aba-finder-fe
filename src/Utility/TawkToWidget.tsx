import React, { useEffect, useRef } from 'react';

interface TawkToWidgetProps {
  widgetId: string;
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

const TawkToWidget: React.FC<TawkToWidgetProps> = ({
  widgetId,
  visitorName,
  visitorEmail,
  onLoad,
  onStatusChange,
}) => {
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;

    try {
      // Initialize Tawk_API
      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_LoadStart = new Date();

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
        
                }
              };
            }
          }

  
          onLoad?.();
        } catch (error) {
          
        }
      };

      window.Tawk_API.onStatusChange = function(status: string) {
        try {

          onStatusChange?.(status);
        } catch (error) {
          
        }
      };

      // Set visitor information if provided
      if (visitorName || visitorEmail) {
        window.Tawk_API.setVisitorInformation = function(name: string, email: string) {
          try {
            if (window.Tawk_API && window.Tawk_API.$_Tawk) {
              if (typeof window.Tawk_API.$_Tawk.i18next === 'function') {
                window.Tawk_API.$_Tawk.setVisitorInformation(name, email);
              } else {
      
              }
            }
          } catch (error) {

          }
        };
      }

      // Create and inject the script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://embed.tawk.to/${widgetId}`;
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');
      
      script.onerror = function() {

      };

      scriptRef.current = script;
      document.head.appendChild(script);
      isInitialized.current = true;

    } catch (error) {
      
    }

    // Cleanup function
    return () => {
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
      }
    };
  }, [widgetId, visitorName, visitorEmail, onLoad, onStatusChange]);

  // Set visitor information when props change
  useEffect(() => {
    if (window.Tawk_API && (visitorName || visitorEmail)) {
      try {
        window.Tawk_API.setVisitorInformation?.(visitorName || '', visitorEmail || '');
      } catch (error) {
        
      }
    }
  }, [visitorName, visitorEmail]);

  return null; // This component doesn't render anything
};

export default TawkToWidget; 