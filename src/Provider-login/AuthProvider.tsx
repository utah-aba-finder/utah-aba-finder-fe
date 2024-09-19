import React, { createContext, useContext, useState, useCallback } from 'react';

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
  loggedInProvider: any;
  setLoggedInProvider: (provider: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(sessionStorage.getItem('authToken'));
  const [loggedInProvider, setLoggedInProvider] = useState<any>(null);

  const setToken = useCallback((newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      sessionStorage.setItem('authToken', newToken);
    } else {
      sessionStorage.removeItem('authToken');
    }
  }, []);

  const contextValue: AuthContextType = {
    token,
    setToken,
    isAuthenticated: !!token,
    loggedInProvider,
    setLoggedInProvider,
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