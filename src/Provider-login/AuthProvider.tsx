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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setTokenState] = useState<string | null>(
    sessionStorage.getItem("authToken")
  );
  const [loggedInProvider, setLoggedInProvider] = useState<any>(
    JSON.parse(sessionStorage.getItem("loggedInProvider") || "null")
  );
  const navigate = useNavigate();

  const logout = useCallback(() => {
    setTokenState(null);
    setLoggedInProvider(null);
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("tokenExpiry");
    localStorage.removeItem("authToken");
    navigate("/login");
    toast.info("You have been logged out");
  }, [navigate]);

  const validateToken = (token: string): boolean => {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const currentTime = Date.now() / 1000;

      if (!decoded.exp) {
        console.error("Token missing expiration");
        return false;
      }

      if (decoded.exp < currentTime) {
        console.error("Token expired");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  };

  const setToken = useCallback(
    (newToken: string | null) => {
      if (newToken && !validateToken(newToken)) {
        console.error("Invalid token provided");
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

      const decoded = jwtDecode<TokenPayload>(newToken);
      const expirationTime = decoded.exp * 1000;
      sessionStorage.setItem("tokenExpiry", expirationTime.toString());

      setToken(newToken);
    },
    [setToken, logout]
  );

  const checkTokenExpiration = useCallback(
    (token: string) => {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        const expirationTime = decoded.exp * 1000;
        const currentTime = Date.now();
        const timeUntilExpiration = expirationTime - currentTime;
  
        console.log('Token Expiration Details:', {
          currentTime: new Date(currentTime).toLocaleTimeString(),
          expirationTime: new Date(expirationTime).toLocaleTimeString(),
          timeUntilExpiration: Math.floor(timeUntilExpiration / 1000 / 60) + ' minutes',
        });
  
        if (currentTime > expirationTime) {
          console.log('Token already expired');
          logout();
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
          clearExistingTimeouts();
          toast.error("Session expired. Please log in again.", {
            toastId: "session-expired",
            position: "top-center",
            autoClose: 2000,
          });
          logout();
        }, timeUntilExpiration));
  
        // 5-minute warning
        const fiveMinWarning = timeUntilExpiration - 5 * 60 * 1000;
        if (fiveMinWarning > 0) {
          timeouts.push(setTimeout(() => {
            if (!token) return; // Check if still logged in
            console.log('Showing 5-minute warning');
            toast.warning(
              "Your session will expire in 5 minutes. Please save your work.",
              {
                toastId: "session-warning-five-min",
                position: "top-center",
                autoClose: false,
                closeOnClick: false,
                closeButton: true,
                draggable: false,
              }
            );
          }, fiveMinWarning));
        }
  
        // 60-second warning
        const oneMinWarning = timeUntilExpiration - 60 * 1000;
        if (oneMinWarning > 0) {
          timeouts.push(setTimeout(() => {
            if (!token) return; // Check if still logged in
            console.log('Showing 1-minute warning');
            toast.dismiss("session-warning-five-min");
            toast.warning(
              "Your session will expire in 60 seconds. Please save your work.",
              {
                toastId: "session-warning-one-min",
                position: "top-center",
                autoClose: false,
                closeOnClick: false,
                closeButton: true,
                draggable: false,
              }
            );
          }, oneMinWarning));
        }
  
        return () => {
          timeouts.forEach((timeout: NodeJS.Timeout) => clearTimeout(timeout));
          clearExistingTimeouts();
        };
  
      } catch (error) {
        console.error("Error decoding token:", error);
        logout();
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
      }, 4 * 60 * 1000); 

      inactivityTimeout = setTimeout(() => {
        toast.dismiss("inactivity-warning"); 
        toast.error("Logging out due to inactivity", {
          toastId: "inactivity-logout",
          position: "top-center",
          autoClose: 2000,
        });
        setTimeout(() => {
          logout();
        }, 1000); 
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
