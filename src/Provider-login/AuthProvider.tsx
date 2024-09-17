import React, { createContext, useState, useContext } from 'react';

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  loggedInProvider: any;
}

export const AuthContext = createContext<AuthContextType>({
    token: null,
    setToken: () => {},
    loggedInProvider: null,
  });

export const AuthProvider: React.FC<{ children: React.ReactNode }>  = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loggedInProvider, setLoggedInProvider] = useState<any>(null);

  return (
    <AuthContext.Provider value={{ token, setToken, loggedInProvider }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};