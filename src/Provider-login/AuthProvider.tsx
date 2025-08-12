import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getApiBaseUrl } from "../Utility/config";

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
  logout: (reason?: 'inactivity' | 'session-expired' | 'manual') => void;
  initializeSession: (token: string) => void;
  // Multi-Provider Support
  userProviders: any[];
  activeProvider: any;
  setActiveProvider: (provider: any) => void;
  fetchUserProviders: () => Promise<void>;
  switchProvider: (providerId: number) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setTokenState] = useState<string | null>(() => {
    const storedToken = sessionStorage.getItem("authToken");
    
    return storedToken;
  });
  const [loggedInProvider, setLoggedInProvider] = useState<any>(
    JSON.parse(sessionStorage.getItem("loggedInProvider") || "null")
  );
  
  // Multi-Provider State
  const [userProviders, setUserProviders] = useState<any[]>([]);
  const [activeProvider, setActiveProviderState] = useState<any>(
    JSON.parse(sessionStorage.getItem("activeProvider") || "null")
  );
  
  const navigate = useNavigate();

  const logout = useCallback((reason?: 'inactivity' | 'session-expired' | 'manual') => {
    // Clear all session-related toasts before logging out
    toast.dismiss("session-warning-five-min");
    toast.dismiss("session-warning-one-min");
    toast.dismiss("session-expired");
    toast.dismiss("inactivity-warning");
    toast.dismiss("inactivity-logout");
    
    // Store logout reason in sessionStorage for the login page to check
    if (reason) {
      sessionStorage.setItem("logoutReason", reason);
    }
    
    setTokenState(null);
    setLoggedInProvider(null);
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("tokenExpiry");
    localStorage.removeItem("authToken");
    navigate("/login");
    
    // Only show toast for manual logout
    if (reason === 'manual' || !reason) {
      toast.info("You have been logged out", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
    
    // Store logout reason for inactivity and session-expired
    if (reason === 'inactivity' || reason === 'session-expired') {
      sessionStorage.setItem("logoutReason", reason);
    }
  }, [navigate]);

  const validateToken = (token: string): boolean => {
    if (!token) return false;
    
    try {
      // Check if this is a temporary token (base64 encoded user data)
      try {
        const decoded = JSON.parse(atob(token));
        // If we can decode it as JSON, it's our temporary token
        return true;
      } catch {
        // If not JSON, try to decode as JWT
        const decoded = jwtDecode<TokenPayload>(token);
        const currentTime = Date.now() / 1000;

        if (!decoded.exp) {
          // If no expiration, assume it's valid (for tokens without exp)
          return true;
        }

        if (decoded.exp < currentTime) {
          return false;
        }

        return true;
      }
    } catch (error) {
      
      // Don't log out on validation errors, just return false
      return false;
    }
  };

  const setToken = useCallback(
    (newToken: string | null) => {
      if (newToken && !validateToken(newToken)) {

        logout();
        return;
      }

      setTokenState(newToken);
      if (newToken) {
        sessionStorage.setItem("authToken", newToken);
      } else {
        sessionStorage.removeItem("authToken");
      }
    },
    [logout]
  );

  const initializeSession = useCallback(
    (newToken: string) => {
      if (!validateToken(newToken)) {
        logout();
        return;
      }

      // Check if this is a temporary token
      try {
        const decoded = JSON.parse(atob(newToken));
        // For temporary tokens, set a 24-hour expiration
        const expirationTime = Date.now() + (24 * 60 * 60 * 1000);
        sessionStorage.setItem("tokenExpiry", expirationTime.toString());

      } catch {
        // For JWT tokens, use the token's expiration
        const decoded = jwtDecode<TokenPayload>(newToken);
        const expirationTime = decoded.exp * 1000;
        sessionStorage.setItem("tokenExpiry", expirationTime.toString());

      }

      setToken(newToken);
    },
    [setToken, logout]
  );

  const checkTokenExpiration = useCallback(
    (token: string) => {
      try {
        // Check if this is a temporary token first
        let expirationTime: number;
        let timeUntilExpiration: number;
        
        try {
          const decoded = JSON.parse(atob(token));
          // For temporary tokens, use the stored expiration time
          const storedExpiry = sessionStorage.getItem("tokenExpiry");
          expirationTime = storedExpiry ? parseInt(storedExpiry) : Date.now() + (24 * 60 * 60 * 1000);
        } catch {
          // For JWT tokens, decode and use token expiration
          const decoded = jwtDecode<TokenPayload>(token);
          expirationTime = decoded.exp * 1000;
        }
        
        const currentTime = Date.now();
        timeUntilExpiration = expirationTime - currentTime;
  
        if (currentTime > expirationTime) {
          logout('session-expired');
          return;
        }
  
        const clearExistingTimeouts = () => {
          toast.dismiss("session-warning-five-min");
          toast.dismiss("session-warning-one-min");
          toast.dismiss("session-expired");
        };
  
        clearExistingTimeouts();
  
        const timeouts: NodeJS.Timeout[] = [];
  
        timeouts.push(setTimeout(() => {
          // Only show session expired toast if user is still logged in
          if (token) {
            clearExistingTimeouts();
            toast.error("Session expired. Please log in again.", {
              toastId: "session-expired",
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
            logout('session-expired');
          }
        }, timeUntilExpiration));
  
        // 5-minute warning
        const fiveMinWarning = timeUntilExpiration - 5 * 60 * 1000;
        if (fiveMinWarning > 0) {
                  timeouts.push(setTimeout(() => {
          // Only show warning if user is still logged in
          if (token && sessionStorage.getItem("authToken")) {
            toast.warning(
              "Your session will expire in 5 minutes. Please save your work.",
              {
                toastId: "session-warning-five-min",
                position: "top-right",
                autoClose: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              }
            );
          }
        }, fiveMinWarning));
        }
  
        // 60-second warning
        const oneMinWarning = timeUntilExpiration - 60 * 1000;
        if (oneMinWarning > 0) {
                  timeouts.push(setTimeout(() => {
          // Only show warning if user is still logged in
          if (token && sessionStorage.getItem("authToken")) {
            toast.dismiss("session-warning-five-min");
            toast.warning(
              "Your session will expire in 60 seconds. Please save your work.",
              {
                toastId: "session-warning-one-min",
                position: "top-right",
                autoClose: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              }
            );
          }
        }, oneMinWarning));
        }
  
        return () => {
          timeouts.forEach((timeout: NodeJS.Timeout) => clearTimeout(timeout));
          clearExistingTimeouts();
        };
  
      } catch (error) {
        logout('session-expired');
      }
    },
    [logout]
  );

  // In inactivity monitoring useEffect:
  useEffect(() => {
    if (!token) return;

    let inactivityTimeout: NodeJS.Timeout;
    let warningTimeout: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimeout);
      clearTimeout(warningTimeout);

      toast.dismiss("inactivity-warning");

      warningTimeout = setTimeout(() => {
        // Only show inactivity warning if user is still logged in
        if (token && sessionStorage.getItem("authToken")) {
          toast.warning(
            "You will be logged out in 60 seconds due to inactivity",
            {
              toastId: "inactivity-warning",
              position: "top-center",
              autoClose: false,
              closeOnClick: false,
              closeButton: true,
              draggable: false,
            }
          );
        }
      }, 4 * 60 * 1000); 

      inactivityTimeout = setTimeout(() => {
        // Only show inactivity logout if user is still logged in
        if (token && sessionStorage.getItem("authToken")) {
          toast.dismiss("inactivity-warning"); 
          toast.error("Logging out due to inactivity", {
            toastId: "inactivity-logout",
            position: "top-center",
            autoClose: 2000,
          });
          setTimeout(() => {
            logout('inactivity');
          }, 1000); 
        }
      }, 5 * 60 * 1000); 
    };

    const events = [
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "mousemove",
    ];
    events.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer);
    });

    resetInactivityTimer();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer);
      });
      clearTimeout(inactivityTimeout);
      clearTimeout(warningTimeout);
      toast.dismiss("inactivity-warning");
    };
  }, [token, logout]);

  useEffect(() => {
    if (token) {
      sessionStorage.setItem("authToken", token);
      const cleanup = checkTokenExpiration(token);
      return cleanup;
    } else {
      sessionStorage.removeItem("authToken");
      toast.dismiss("session-warning-five-min");
      toast.dismiss("session-warning-one-min");
      toast.dismiss("session-expired");
    }
  }, [token, checkTokenExpiration]);

  // Multi-Provider Functions
  const fetchUserProviders = useCallback(async () => {
    if (!token || !loggedInProvider) return;
    
    try {
      // Get user email from the logged in provider or token
      const userEmail = loggedInProvider.email || loggedInProvider.user_email;
      if (!userEmail) return;
      
      const response = await fetch(`${getApiBaseUrl()}/api/v1/providers/user_providers?user_email=${encodeURIComponent(userEmail)}`, {
        headers: {
          'Authorization': token,
        }
      });

      if (response.ok) {
        const data = await response.json();
        const providers = data.providers || [];
        setUserProviders(providers);
        
        // If no active provider is set, set the first one as active
        if (!activeProvider && providers.length > 0) {
          setActiveProviderState(providers[0]);
          sessionStorage.setItem("activeProvider", JSON.stringify(providers[0]));
        }
      } else {
        console.error('Failed to fetch user providers:', response.status);
      }
    } catch (error) {
      console.error('Error fetching user providers:', error);
    }
  }, [token, loggedInProvider, activeProvider]);

  const switchProvider = useCallback(async (providerId: number) => {
    if (!token || !loggedInProvider) return false;
    
    try {
      const userEmail = loggedInProvider.email || loggedInProvider.user_email;
      if (!userEmail) return false;
      
      const response = await fetch(`${getApiBaseUrl()}/api/v1/providers/set_active_provider`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: userEmail,
          provider_id: providerId
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Find the provider in userProviders and set it as active
          const provider = userProviders.find(p => p.id === providerId);
          if (provider) {
            setActiveProviderState(provider);
            sessionStorage.setItem("activeProvider", JSON.stringify(provider));
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      console.error('Error switching provider:', error);
      return false;
    }
  }, [token, loggedInProvider, userProviders]);

  const setActiveProvider = useCallback((provider: any) => {
    setActiveProviderState(provider);
    sessionStorage.setItem("activeProvider", JSON.stringify(provider));
  }, []);

  // Fetch user providers when logged in (moved here after function definition)
  useEffect(() => {
    if (token && loggedInProvider) {
      fetchUserProviders();
    }
  }, [token, loggedInProvider, fetchUserProviders]);

  const contextValue: AuthContextType = {
    token,
    setToken,
    isAuthenticated: !!token,
    loggedInProvider,
    logout,
    initializeSession,
    setLoggedInProvider: (provider: any) => {
      setLoggedInProvider(provider);
      sessionStorage.setItem("loggedInProvider", JSON.stringify(provider));
    },
    userRole: loggedInProvider?.role || "",
    userProviders,
    activeProvider,
    setActiveProvider,
    fetchUserProviders,
    switchProvider,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
