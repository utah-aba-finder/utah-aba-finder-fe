import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface TokenPayload {
  exp: number;
  role?: string;
}

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
  loggedInProvider: any;
  setLoggedInProvider: (provider: any) => void;
  userRole: string;
  logout: () => void;
  initializeSession: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(sessionStorage.getItem('authToken'));
  const [loggedInProvider, setLoggedInProvider] = useState<any>(
    JSON.parse(sessionStorage.getItem('loggedInProvider') || 'null')
  );
  const navigate = useNavigate();

  const logout = useCallback(() => {
    setTokenState(null);
    setLoggedInProvider(null);
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('tokenExpiry');
    localStorage.removeItem('authToken');
    navigate('/login');
    toast.info('You have been logged out');
  }, [navigate]);

  const validateToken = (token: string): boolean => {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const currentTime = Date.now() / 1000;
      
      if (!decoded.exp) {
        console.error('Token missing expiration');
        return false;
      }
  
      if (decoded.exp < currentTime) {
        console.error('Token expired');
        return false;
      }
  
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };

  const setToken = useCallback((newToken: string | null) => {
    if (newToken && !validateToken(newToken)) {
      console.error('Invalid token provided');
      logout();
      return;
    }
    
    setTokenState(newToken);
    if (newToken) {
      sessionStorage.setItem('authToken', newToken);
    } else {
      sessionStorage.removeItem('authToken');
    }
  }, [logout]);

  const initializeSession = useCallback((newToken: string) => {
    if (!validateToken(newToken)) {
      logout();
      return;
    }

    const decoded = jwtDecode<TokenPayload>(newToken);
    const expirationTime = decoded.exp * 1000;
    sessionStorage.setItem('tokenExpiry', expirationTime.toString());
    
    const timeoutDuration = Math.max(0, expirationTime - Date.now() - 300000);
    setTimeout(() => {
      toast.warning('Your session will expire soon. Please save your work.');
    }, timeoutDuration);

    setToken(newToken);
  }, [setToken, logout]);

  const checkTokenExpiration = useCallback((token: string) => {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const expirationTime = decoded.exp * 1000;
      const currentTime = Date.now();

      if (currentTime > expirationTime) {
        logout();
      } else {
        // Set timeout for expiration
        const timeUntilExpiration = expirationTime - currentTime;
        setTimeout(() => {
          toast.error('Session expired. Please log in again.');
          logout();
        }, timeUntilExpiration);

        // Set warning 5 minutes before expiration
        const warningTime = timeUntilExpiration - 300000; // 5 minutes before expiration
        if (warningTime > 0) {
          setTimeout(() => {
            toast.warning('Your session will expire in 5 minutes. Please save your work.');
          }, warningTime);
        }
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      logout();
    }
  }, [logout]);

  // Inactivity monitoring
  useEffect(() => {
    if (!token) return;

    let inactivityTimeout: NodeJS.Timeout;
    
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(() => {
        toast.warning('Logging out due to inactivity');
        logout();
      }, 30 * 60 * 1000); // 30 minutes
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, resetInactivityTimer);
    });

    resetInactivityTimer();

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetInactivityTimer);
      });
      clearTimeout(inactivityTimeout);
    };
  }, [token, logout]);

  // Token effect
  useEffect(() => {
    if (token) {
      sessionStorage.setItem('authToken', token);
      checkTokenExpiration(token);
    } else {
      sessionStorage.removeItem('authToken');
    }
  }, [token, checkTokenExpiration]);

  const contextValue: AuthContextType = {
    token,
    setToken,
    isAuthenticated: !!token,
    loggedInProvider,
    logout,
    initializeSession,
    setLoggedInProvider: (provider: any) => {
      setLoggedInProvider(provider);
      sessionStorage.setItem('loggedInProvider', JSON.stringify(provider));
    },
    userRole: loggedInProvider?.role || '',
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};