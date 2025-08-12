import { useEffect, useCallback } from 'react';

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}

interface TawkToConfig {
  widgetId: string;
  visitorName?: string;
  visitorEmail?: string;
}

export const useTawkTo = (config: TawkToConfig) => {
  const initializeTawkTo = useCallback(() => {
    try {
      // Initialize Tawk_API if not already done
      if (typeof window !== 'undefined') {
        window.Tawk_API = window.Tawk_API || {};
        window.Tawk_LoadStart = new Date();
        
        // Add error handling for i18next
        window.Tawk_API.onLoad = function() {
          try {
            // Check if i18next is available before using it
            if (window.Tawk_API && window.Tawk_API.$_Tawk && typeof window.Tawk_API.$_Tawk.i18next === 'function') {
      
            } else {
              
            }
          } catch (error) {
            
          }
        };

        window.Tawk_API.onStatusChange = function(status: string) {
          try {

          } catch (error) {
            
          }
        };

        // Set visitor information with error handling
        if (config.visitorName || config.visitorEmail) {
          window.Tawk_API.setVisitorInformation = function(name: string, email: string) {
            try {
              if (window.Tawk_API && window.Tawk_API.$_Tawk) {
                // Only call setVisitorInformation if i18next is available
                if (typeof window.Tawk_API.$_Tawk.i18next === 'function') {
                  window.Tawk_API.$_Tawk.setVisitorInformation(name, email);
                } else {
      
                }
              }
            } catch (error) {

            }
          };
        }
      }
    } catch (error) {
      
    }
  }, [config.visitorName, config.visitorEmail]);

  const setVisitorInformation = useCallback((name: string, email: string) => {
    try {
      if (window.Tawk_API && window.Tawk_API.setVisitorInformation) {
        window.Tawk_API.setVisitorInformation(name, email);
      }
    } catch (error) {
      
    }
  }, []);

  const maximizeWidget = useCallback(() => {
    try {
      if (window.Tawk_API && window.Tawk_API.maximize) {
        window.Tawk_API.maximize();
      }
    } catch (error) {
      
    }
  }, []);

  const minimizeWidget = useCallback(() => {
    try {
      if (window.Tawk_API && window.Tawk_API.minimize) {
        window.Tawk_API.minimize();
      }
    } catch (error) {
      
    }
  }, []);

  const toggleWidget = useCallback(() => {
    try {
      if (window.Tawk_API && window.Tawk_API.toggle) {
        window.Tawk_API.toggle();
      }
    } catch (error) {
      
    }
  }, []);

  useEffect(() => {
    initializeTawkTo();
  }, [initializeTawkTo]);

  return {
    setVisitorInformation,
    maximizeWidget,
    minimizeWidget,
    toggleWidget,
  };
}; 