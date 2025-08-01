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
              console.log('Tawk.to loaded successfully with i18next support');
            } else {
              console.warn('Tawk.to loaded but i18next not available');
            }
          } catch (error) {
            console.warn('Tawk.to onLoad error:', error);
          }
        };

        window.Tawk_API.onStatusChange = function(status: string) {
          try {
            console.log('Tawk.to status changed:', status);
          } catch (error) {
            console.warn('Tawk.to status change error:', error);
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
                  console.warn('Tawk.to i18next not available, skipping visitor information');
                }
              }
            } catch (error) {
              console.warn('Tawk.to setVisitorInformation error:', error);
            }
          };
        }
      }
    } catch (error) {
      console.warn('Tawk.to initialization error:', error);
    }
  }, [config.visitorName, config.visitorEmail]);

  const setVisitorInformation = useCallback((name: string, email: string) => {
    try {
      if (window.Tawk_API && window.Tawk_API.setVisitorInformation) {
        window.Tawk_API.setVisitorInformation(name, email);
      }
    } catch (error) {
      console.warn('Tawk.to setVisitorInformation error:', error);
    }
  }, []);

  const maximizeWidget = useCallback(() => {
    try {
      if (window.Tawk_API && window.Tawk_API.maximize) {
        window.Tawk_API.maximize();
      }
    } catch (error) {
      console.warn('Tawk.to maximize error:', error);
    }
  }, []);

  const minimizeWidget = useCallback(() => {
    try {
      if (window.Tawk_API && window.Tawk_API.minimize) {
        window.Tawk_API.minimize();
      }
    } catch (error) {
      console.warn('Tawk.to minimize error:', error);
    }
  }, []);

  const toggleWidget = useCallback(() => {
    try {
      if (window.Tawk_API && window.Tawk_API.toggle) {
        window.Tawk_API.toggle();
      }
    } catch (error) {
      console.warn('Tawk.to toggle error:', error);
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