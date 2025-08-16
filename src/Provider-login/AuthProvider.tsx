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
    console.log('🔄 AuthProvider: Initializing token state', { hasStoredToken: !!storedToken });
    
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
  
  // Debug authentication state changes
  useEffect(() => {
    console.log('🔄 AuthProvider: Authentication state changed', {
      hasToken: !!token,
      hasLoggedInProvider: !!loggedInProvider,
      userRole: loggedInProvider?.role,
      isAuthenticated: !!token
    });
  }, [token, loggedInProvider]);

  
  const navigate = useNavigate();

  // --- Helpers ---------------------------------------------------------------

  const getApiBaseUrl = () => {
    if (process.env.NODE_ENV === 'development') {
      // You currently hit prod while dev'ing; keep that behavior
      return 'https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com';
    }
    return process.env.REACT_APP_API_BASE_URL || 'https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com';
  };

  // Safely pull a numeric/string user id for the Authorization header
  const extractUserIdForAuth = (token: string | null, loggedInProvider: any): string | null => {
    if (!token) return loggedInProvider?.id?.toString?.() || null;

    // Try base64 JSON (your current approach)
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _decoded = JSON.parse(atob(token));
      if (_decoded?.id) return _decoded.id.toString();
    } catch {
      /* noop */
    }
    // Fallback to using loggedInProvider.id (should be user id in your flow)
    return loggedInProvider?.id?.toString?.() || null;
  };

  // Normalize /providers/:id responses into { id, type, states, attributes: {...} }
  const normalizeProviderDetail = (raw: any) => {
    // Common API shapes you handled before
    let p = raw?.data;
    if (Array.isArray(p)) p = p[0];
    if (!p) p = raw?.provider || raw;

    // Build a safe object for ProviderEdit expectations
    const id = p?.id ?? p?.attributes?.id ?? p?.provider_id ?? 0;
    const states = p?.states || p?.attributes?.states || [];
    const attributes = p?.attributes || p || {};

    return {
      id,
      type: p?.type || 'provider',
      states,
      attributes: {
        id,
        states,
        password: '',
        username: attributes?.email || p?.email || '',
        name: attributes?.name || p?.name || '',
        email: attributes?.email || p?.email || '',
        website: attributes?.website || p?.website || '',
        cost: attributes?.cost || p?.cost || '',
        min_age: attributes?.min_age ?? p?.min_age ?? null,
        max_age: attributes?.max_age ?? p?.max_age ?? null,
        waitlist: attributes?.waitlist ?? p?.waitlist ?? null,
        telehealth_services: attributes?.telehealth_services ?? p?.telehealth_services ?? null,
        spanish_speakers: attributes?.spanish_speakers ?? p?.spanish_speakers ?? null,
        at_home_services: attributes?.at_home_services ?? p?.at_home_services ?? null,
        in_clinic_services: attributes?.in_clinic_services ?? p?.in_clinic_services ?? null,
        provider_type: attributes?.provider_type || p?.provider_type || [],
        insurance: attributes?.insurance || p?.insurance || [],
        counties_served: attributes?.counties_served || p?.counties_served || [],
        locations: attributes?.locations || p?.locations || [],
        logo: attributes?.logo ?? p?.logo ?? null,
        updated_last: attributes?.updated_last ?? p?.updated_last ?? null,
        status: attributes?.status ?? p?.status ?? null,
        in_home_only: attributes?.in_home_only ?? p?.in_home_only ?? false,
        service_delivery:
          attributes?.service_delivery ??
          p?.service_delivery ?? { in_home: false, in_clinic: false, telehealth: false },
      },
    };
  };

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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _decoded = JSON.parse(atob(token));
        // If we can decode it as JSON, it's our temporary token
        return true;
      } catch {
        // If not JSON, try to decode as JWT
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _decoded = jwtDecode<TokenPayload>(token);
        const currentTime = Date.now() / 1000;

        if (!_decoded.exp) {
          // If no expiration, assume it's valid (for tokens without exp)
          return true;
        }

        if (_decoded.exp < currentTime) {
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
      console.log('🔐 AuthProvider: Initializing session with token:', { 
        hasToken: !!newToken, 
        tokenLength: newToken?.length,
        currentLoggedInProvider: loggedInProvider 
      });
      
      if (!validateToken(newToken)) {
        console.error('❌ AuthProvider: Token validation failed');
        logout();
        return;
      }

      // Check if this is a temporary token
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _decoded = JSON.parse(atob(newToken));
        console.log('🔐 AuthProvider: Using temporary token with 24-hour expiration');
        // For temporary tokens, set a 24-hour expiration
        const expirationTime = Date.now() + (24 * 60 * 60 * 1000);
        sessionStorage.setItem("tokenExpiry", expirationTime.toString());

      } catch {
        console.log('🔐 AuthProvider: Using JWT token with built-in expiration');
        // For JWT tokens, use the token's expiration
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _decoded = jwtDecode<TokenPayload>(newToken);
        const expirationTime = _decoded.exp * 1000;
        sessionStorage.setItem("tokenExpiry", expirationTime.toString());

      }

      setToken(newToken);
      console.log('✅ AuthProvider: Session initialized successfully');
    },
    [setToken, logout, loggedInProvider]
  );

  const checkTokenExpiration = useCallback(
    (token: string) => {
      try {
        // Check if this is a temporary token first
        let expirationTime: number;
        let timeUntilExpiration: number;
        
        try {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const _decoded = JSON.parse(atob(token));
          // For temporary tokens, use the stored expiration time
          const storedExpiry = sessionStorage.getItem("tokenExpiry");
          expirationTime = storedExpiry ? parseInt(storedExpiry) : Date.now() + (24 * 60 * 60 * 1000);
        } catch {
          // For JWT tokens, decode and use token expiration
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const _decoded = jwtDecode<TokenPayload>(token);
          expirationTime = _decoded.exp * 1000;
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
    console.log('🔄 AuthProvider: Inactivity monitoring useEffect triggered', { token: !!token });
    if (!token) return;

    let inactivityTimeout: NodeJS.Timeout;
    let warningTimeout: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      console.log('🔄 AuthProvider: Resetting inactivity timer');
      clearTimeout(inactivityTimeout);
      clearTimeout(warningTimeout);

      toast.dismiss("inactivity-warning");

      warningTimeout = setTimeout(() => {
        // Only show inactivity warning if user is still logged in
        if (token && sessionStorage.getItem("authToken")) {
          console.log('⚠️ AuthProvider: Showing inactivity warning');
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
          console.log('⏰ AuthProvider: Logging out due to inactivity');
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
    console.log('🔄 AuthProvider: Token useEffect triggered', { token: !!token });
    if (token) {
      console.log('✅ AuthProvider: Setting authToken in sessionStorage');
      sessionStorage.setItem("authToken", token);
      const cleanup = checkTokenExpiration(token);
      return cleanup;
    } else {
      console.log('❌ AuthProvider: Removing authToken from sessionStorage');
      sessionStorage.removeItem("authToken");
      toast.dismiss("session-warning-five-min");
      toast.dismiss("session-warning-one-min");
      toast.dismiss("session-expired");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Removed checkTokenExpiration to prevent circular dependency

  // Multi-Provider Functions
  const fetchUserProviders = useCallback(async () => {
    if (!token || !loggedInProvider) return;

    try {
      // 1) Get user email (endpoint requires it)
      const userEmail =
        loggedInProvider?.attributes?.email ||
        loggedInProvider?.email ||
        loggedInProvider?.user_email;

      if (!userEmail) {
        console.error('fetchUserProviders: No user email available');
        return;
      }

      // 2) User id for Authorization header
      const userId = extractUserIdForAuth(token, loggedInProvider);
      if (!userId) {
        console.error('fetchUserProviders: No user id for Authorization');
        return;
      }

      // 3) Call user_providers (list is lightweight; no attributes)
      const url = `${getApiBaseUrl()}/api/v1/providers/user_providers?user_email=${encodeURIComponent(userEmail)}`;
      const listResp = await fetch(url, {
        headers: { Authorization: userId, 'Content-Type': 'application/json' },
      });

      if (!listResp.ok) {
        const txt = await listResp.text();
        console.error('fetchUserProviders: user_providers failed', listResp.status, txt);
        return;
      }

      const listData = await listResp.json();
      if (!listData?.success || !Array.isArray(listData?.providers)) {
        console.error('fetchUserProviders: Unexpected list response format', listData);
        return;
      }

      setUserProviders(listData.providers);

      // 4) Decide which provider to activate
      //    Priority: sessionStorage.activeProvider.id → backend active_provider_id → first in list
      let targetId: number | null = null;

      const stored = sessionStorage.getItem('activeProvider');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed?.id) targetId = Number(parsed.id);
        } catch {/* noop */}
      }

      if (!targetId && listData?.user?.active_provider_id) {
        targetId = Number(listData.user.active_provider_id);
      }

      if (!targetId && listData.providers.length > 0) {
        targetId = Number(listData.providers[0].id);
      }

      if (!targetId) return; // nothing to activate

      // 5) Fetch full provider detail (with attributes) BEFORE setting activeProvider
      const detailResp = await fetch(`${getApiBaseUrl()}/api/v1/providers/${targetId}`, {
        headers: { Authorization: userId, 'Content-Type': 'application/json' },
      });

      if (!detailResp.ok) {
        const txt = await detailResp.text();
        console.error('fetchUserProviders: provider detail failed', detailResp.status, txt);
        return;
      }

      const detailData = await detailResp.json();
      const normalized = normalizeProviderDetail(detailData);

      setActiveProviderState(normalized);
      sessionStorage.setItem('activeProvider', JSON.stringify(normalized));
    } catch (err) {
      console.error('fetchUserProviders: Error', err);
    }
  }, [token, loggedInProvider]);

  const switchProvider = useCallback(async (providerId: number) => {
    if (!token || !loggedInProvider || !providerId) return false;

    try {
      const userId = extractUserIdForAuth(token, loggedInProvider);
      if (!userId) {
        console.error('switchProvider: No user id for Authorization');
        return false;
      }

      // 1) Tell backend to set the context
      const setResp = await fetch(`${getApiBaseUrl()}/api/v1/providers/set_active_provider`, {
        method: 'POST',
        headers: { Authorization: userId, 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider_id: providerId }),
      });

      if (!setResp.ok) {
        const txt = await setResp.text();
        console.error('switchProvider: set_active_provider failed', setResp.status, txt);
        return false;
      }

      const setData = await setResp.json();
      if (!setData?.success) {
        console.error('switchProvider: set_active_provider returned non-success', setData);
        return false;
      }

      // 2) Fetch the full provider record (the editor needs attributes)
      const detailResp = await fetch(`${getApiBaseUrl()}/api/v1/providers/${providerId}`, {
        headers: { Authorization: userId, 'Content-Type': 'application/json' },
      });

      if (!detailResp.ok) {
        const txt = await detailResp.text();
        console.error('switchProvider: provider detail failed', detailResp.status, txt);
        return false;
      }

      const detailData = await detailResp.json();
      const normalized = normalizeProviderDetail(detailData);

      // 3) Update state + sessionStorage
      setActiveProviderState(normalized);
      sessionStorage.setItem('activeProvider', JSON.stringify(normalized));
      return true;
    } catch (err) {
      console.error('switchProvider: Error', err);
      return false;
    }
  }, [token, loggedInProvider]);

  const setActiveProvider = useCallback((provider: any) => {
    setActiveProviderState(provider);
    sessionStorage.setItem("activeProvider", JSON.stringify(provider));
  }, []);

  // Fetch user providers when logged in (moved here after function definition)
  useEffect(() => {
    if (token && loggedInProvider) {
      fetchUserProviders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, loggedInProvider]); // Removed fetchUserProviders to prevent infinite loop

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
