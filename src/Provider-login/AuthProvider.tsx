import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
  loggedInProvider: any;
  setLoggedInProvider: (provider: any) => void;
  userRole: string;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(sessionStorage.getItem('authToken'));
  const [loggedInProvider, setLoggedInProvider] = useState<any>(
    JSON.parse(sessionStorage.getItem('loggedInProvider') || 'null')
  );
  const navigate = useNavigate();

  const setToken = useCallback((newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      sessionStorage.setItem('authToken', newToken);
    } else {
      sessionStorage.removeItem('authToken');
    }
  }, []);
  useEffect(() => {
    if (token) {
      sessionStorage.setItem('authToken', token);
      checkTokenExpiration(token);
    } else {
      sessionStorage.removeItem('authToken');
    }
  }, [token]);

  const checkTokenExpiration = (token: string) => {
    try {
      const decodedToken: any = jwtDecode(token);
      const expirationTime = decodedToken.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();

      if (currentTime > expirationTime) {
        logout();
      } else {
        // Set a timeout to logout when the token expires
        const timeUntilExpiration = expirationTime - currentTime;
        setTimeout(logout, timeUntilExpiration);
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      logout();
    }
  };
  const logout = () => {
    setToken(null);
    setLoggedInProvider(null);
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('authToken');
    navigate('/login');
    toast.info('You have been logged out')
  };

  const contextValue: AuthContextType = {
    token,
    setToken,
    isAuthenticated: !!token,
    loggedInProvider,
    logout,
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