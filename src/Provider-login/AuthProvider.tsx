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
import InactivityModal from "./InactivityModal";

// types
type Role = 'super_admin' | 'provider_admin' | 'user' | string;

interface CurrentUser {
  id: number;
  email: string;
  first_name?: string | null;
  role: Role;
  primary_provider_id?: number | null;
  active_provider_id?: number | null;
}

interface TokenPayload {
  exp: number;
  role?: string;
  id?: number;
}

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
  userRole: string;
  currentUser: CurrentUser | null;
  setCurrentUser: (user: CurrentUser | null) => void;
  authReady: boolean;
  authLoading: boolean;
  loggedInProvider: any;
  setLoggedInProvider: (provider: any) => void;
  logout: (reason?: string) => void;
  initializeSession: (token: string) => void;
  activeProvider: any;
  setActiveProvider: (provider: any) => void;
  availableProviders: any[];
  setAvailableProviders: (providers: any[]) => void;
  switchActiveProvider: (providerId: number) => void;
  hasProviderAccess: (providerId: number) => boolean;
  extractUserIdForAuth: (token: string, loggedInProvider: any) => string | null;
  // Backward compatibility properties
  userProviders: any[];
  switchProvider: (providerId: number) => Promise<boolean>;
  fetchUserProviders: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {

  
  // state
  const [token, setTokenState] = useState<string | null>(sessionStorage.getItem("authToken"));
  const [activeProvider, setActiveProviderState] = useState<any>(
    JSON.parse(sessionStorage.getItem("activeProvider") || "null")
  );
  const [loggedInProvider, setLoggedInProviderState] = useState<any>(
    JSON.parse(sessionStorage.getItem("loggedInProvider") || "null")
  );
  const [currentUser, setCurrentUserState] = useState<CurrentUser | null>(
    JSON.parse(sessionStorage.getItem("currentUser") || "null")
  );
  const [userProviders, setUserProvidersState] = useState<any[]>([]);
  const [authReady, setAuthReady] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Inactivity modal state
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [showInactivityLogout, setShowInactivityLogout] = useState(false);
  const [inactivityCountdown, setInactivityCountdown] = useState(60);

  // stable wrapper: token
  const setToken = useCallback((next: string | null) => {
    setTokenState(next);
    if (next) sessionStorage.setItem("authToken", next);
    else sessionStorage.removeItem("authToken");
  }, []);

  // stable wrapper: activeProvider
  const setActiveProvider = useCallback((provider: any) => {
    setActiveProviderState(provider);
    if (provider) sessionStorage.setItem("activeProvider", JSON.stringify(provider));
    else sessionStorage.removeItem("activeProvider");
  }, []);

  // stable wrapper: loggedInProvider
  const setLoggedInProvider = useCallback((provider: any) => {
    setLoggedInProviderState(provider);
    if (provider) sessionStorage.setItem("loggedInProvider", JSON.stringify(provider));
    else sessionStorage.removeItem("loggedInProvider");
  }, []);

  // stable wrapper: currentUser
  const setCurrentUser = useCallback((user: CurrentUser | null) => {
    setCurrentUserState(user);
    if (user) sessionStorage.setItem("currentUser", JSON.stringify(user));
    else sessionStorage.removeItem("currentUser");
  }, []);

  // Multi-Provider State
  // const [userProviders, setUserProviders] = useState<any[]>([]);
  // const [activeProvider, setActiveProviderState] = useState<any>(
  //   JSON.parse(sessionStorage.getItem("activeProvider") || "null")
  // );
  

  
  const navigate = useNavigate();

  // --- Helpers ---------------------------------------------------------------

  // Persist helpers for currentUser
  // const saveCurrentUser = (u: CurrentUser | null) => {
  //   setCurrentUser(u);
  //   if (u) {
  //     sessionStorage.setItem('currentUser', JSON.stringify(u));
  //     console.log('💾 AuthProvider: Saved currentUser to sessionStorage:', u);
  //   } else {
  //     sessionStorage.removeItem('currentUser');
  //     console.log('🗑️ AuthProvider: Removed currentUser from sessionStorage');
  //   }
  // };

  // Derived state
  const isAuthenticated = !!token && !!currentUser?.id;

  // Safely pull a numeric/string user id for the Authorization header
  const extractUserIdForAuth = useCallback((token: string, loggedInProvider: any): string | null => {
    if (!token) return loggedInProvider?.id?.toString?.() || null;

    // First, check if token is already a user ID (new approach)
    if (/^\d+$/.test(token)) {
      return token;
    }

    // Try base64 JSON (legacy JWT approach)
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _decoded = JSON.parse(atob(token));
      if (_decoded?.id) return _decoded.id.toString();
    } catch {
      /* noop */
    }
    
    // Fallback to using loggedInProvider.id (should be user id in your flow)
    return loggedInProvider?.id?.toString?.() || null;
  }, []);

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

  const logout = useCallback((reason?: string) => {
    
    // Clear all auth data
    setToken(null);
    setLoggedInProvider(null);
    setCurrentUser(null);
    setActiveProvider(null);
    setUserProvidersState([]);
    setAuthLoading(false);
    
    // Clear session storage
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("tokenExpiry");
    sessionStorage.removeItem("loggedInProvider");
    sessionStorage.removeItem("currentUser");
    
    // Show appropriate message
    if (reason === 'inactivity') {
      toast.warning("Session expired due to inactivity. Please log in again.");
    } else if (reason === 'session-expired') {
      toast.warning("Your session has expired. Please log in again.");
    } else if (reason === 'manual') {
      toast.info("You have been logged out successfully.");
    }
    
    // Navigate to login
    navigate("/login");
  }, [navigate, setToken, setLoggedInProvider, setCurrentUser, setActiveProvider, setUserProvidersState]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const validateToken = useCallback((token: string): boolean => {
    if (!token) return false;
    
    // Check if token is already a user ID (new approach)
    if (/^\d+$/.test(token)) {
      return true;
    }
    
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
  }, []);

  const initializeSession = useCallback(
    (newToken: string) => {
      if (!validateToken(newToken)) {
        logout();
        return;
      }

      // Check if this is a temporary token
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _decoded = JSON.parse(atob(newToken));
        // For temporary tokens, set a 7-day expiration
        const expirationTime = Date.now() + (7 * 24 * 60 * 60 * 1000);
        sessionStorage.setItem("tokenExpiry", expirationTime.toString());

      } catch {
        // Check if this is a user ID token
        if (/^\d+$/.test(newToken)) {
          // For user ID tokens, set a 7-day expiration
          const expirationTime = Date.now() + (7 * 24 * 60 * 60 * 1000);
          sessionStorage.setItem("tokenExpiry", expirationTime.toString());
        } else {
          // For JWT tokens, use the token's expiration
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const _decoded = jwtDecode<TokenPayload>(newToken);
          const expirationTime = _decoded.exp * 1000;
          sessionStorage.setItem("tokenExpiry", expirationTime.toString());
        }
      }

      setToken(newToken);
      setAuthLoading(false);
    },
    [logout, validateToken, setToken]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
          expirationTime = storedExpiry ? parseInt(storedExpiry) : Date.now() + (7 * 24 * 60 * 60 * 1000);
        } catch {
          // Check if this is a user ID token
          if (/^\d+$/.test(token)) {
            // For user ID tokens, use the stored expiration time
            const storedExpiry = sessionStorage.getItem("tokenExpiry");
            expirationTime = storedExpiry ? parseInt(storedExpiry) : Date.now() + (7 * 24 * 60 * 60 * 1000);
          } else {
            // For JWT tokens, decode and use token expiration
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _decoded = jwtDecode<TokenPayload>(token);
            expirationTime = _decoded.exp * 1000;
          }
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

  // Inactivity monitoring useEffect:
  useEffect(() => {
    if (!token) return;

    let inactivityTimeout: NodeJS.Timeout;
    let warningTimeout: NodeJS.Timeout;
    let countdownInterval: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      // Removed excessive logging that was causing infinite loop in console
      clearTimeout(inactivityTimeout);
      clearTimeout(warningTimeout);
      clearInterval(countdownInterval);

      // Hide modals when activity is detected
      setShowInactivityWarning(false);
      setShowInactivityLogout(false);
      setInactivityCountdown(60);

      warningTimeout = setTimeout(() => {
        // Only show inactivity warning if user is still logged in
        if (token && sessionStorage.getItem("authToken")) {
          setShowInactivityWarning(true);
          
          // Start countdown
          let countdown = 60;
          setInactivityCountdown(countdown);
          countdownInterval = setInterval(() => {
            countdown--;
            setInactivityCountdown(countdown);
            if (countdown <= 0) {
              clearInterval(countdownInterval);
            }
          }, 1000);
        }
      }, 25 * 60 * 1000); // 25 minutes (was 4 minutes) - Admin-friendly timeout

      inactivityTimeout = setTimeout(() => {
        // Only show inactivity logout if user is still logged in
        if (token && sessionStorage.getItem("authToken")) {
          setShowInactivityWarning(false);
          setShowInactivityLogout(true);
          
          // Logout after 3 seconds
          setTimeout(() => {
            logout('inactivity');
          }, 3000);
        }
      }, 30 * 60 * 1000); // 30 minutes (was 5 minutes) - Admin-friendly timeout
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
      clearInterval(countdownInterval);
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
        return;
      }

      // 2) User id for Authorization header
      const userId = extractUserIdForAuth(token, loggedInProvider);
      if (!userId) {
        return;
      }

      // 3) Call user_providers (list is lightweight; no attributes)
      const url = `${getApiBaseUrl()}/api/v1/providers/user_providers?user_email=${encodeURIComponent(userEmail)}`;
      const listResp = await fetch(url, {
        headers: { 
          'Authorization': userId,
          'Content-Type': 'application/json' 
        },
      });

      if (!listResp.ok) {
        await listResp.text();
        return;
      }

      const listData = await listResp.json();
      if (!listData?.success || !Array.isArray(listData?.providers)) {
        return;
      }

      setUserProvidersState(listData.providers);

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
        headers: { 
          'Authorization': userId,
          'Content-Type': 'application/json' 
        },
      });

      if (!detailResp.ok) {
        await detailResp.text();
        return;
      }

      const detailData = await detailResp.json();
      const normalized = normalizeProviderDetail(detailData);

      setActiveProvider(normalized);
      sessionStorage.setItem('activeProvider', JSON.stringify(normalized));
    } catch (err) {
    }
  }, [token, loggedInProvider, setActiveProvider, setUserProvidersState, extractUserIdForAuth]);

  const switchProvider = useCallback(async (providerId: number) => {
    if (!token || !loggedInProvider || !providerId) return false;

    try {
      const userId = extractUserIdForAuth(token, loggedInProvider);
      if (!userId) {
        return false;
      }

      // 1) Tell backend to set the context
      const setResp = await fetch(`${getApiBaseUrl()}/api/v1/providers/set_active_provider`, {
        method: 'POST',
        headers: { 
          'Authorization': userId,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ provider_id: providerId }),
      });

      if (!setResp.ok) {
        await setResp.text();
        return false;
      }

      const setData = await setResp.json();
      if (!setData?.success) {
        return false;
      }

      // 2) Fetch the full provider record (the editor needs attributes)
      const detailResp = await fetch(`${getApiBaseUrl()}/api/v1/providers/${providerId}`, {
        headers: { 
          'Authorization': userId,
          'Content-Type': 'application/json' 
        },
      });

      if (!detailResp.ok) {
        await detailResp.text();
        return false;
      }

      const detailData = await detailResp.json();
      const normalized = normalizeProviderDetail(detailData);

      // 3) Update state + sessionStorage
      setActiveProvider(normalized);
      sessionStorage.setItem('activeProvider', JSON.stringify(normalized));
      return true;
    } catch (err) {
      return false;
    }
  }, [token, loggedInProvider, setActiveProvider, extractUserIdForAuth]);

  // Fetch user providers when logged in (moved here after function definition)
  useEffect(() => {
    if (token && loggedInProvider) {
      fetchUserProviders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, loggedInProvider]); // Removed fetchUserProviders to prevent infinite loop

  // Restore provider data when currentUser exists but provider data is missing
  useEffect(() => {
    if (!authReady || authLoading) return;
    if (!currentUser || !token) return;
    if (currentUser.role !== 'provider_admin') return;
    
    // Check if we have provider data
    const hasProviderData = loggedInProvider || activeProvider;
    if (hasProviderData) return;
    
    // Try to restore provider data
    const providerId = currentUser.active_provider_id || currentUser.primary_provider_id;
    if (!providerId) return;
    
    
    let cancelled = false;
    (async () => {
      try {
        // Use currentUser.id directly since we know currentUser exists
        const userId = currentUser.id.toString();
        
        if (!userId) {
          return;
        }
        
        // Fetch provider details
        const base = 'https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com';
        const resp = await fetch(`${base}/api/v1/providers/${providerId}`, {
          headers: { 
            'Authorization': userId,
            'Content-Type': 'application/json' 
          },
          credentials: 'include',
        });
        
        if (!resp.ok) {
          await resp.text();
          
          // Don't throw - just log the error, user can still try to refresh manually
          return;
        }
        
        if (!cancelled) {
          const detailData = await resp.json();
          if (detailData) {
            // Normalize provider data (normalizeProviderDetail expects response with data property)                                                          
            const normalized = normalizeProviderDetail(detailData);
            setLoggedInProvider(normalized);
            setActiveProvider(normalized);
            sessionStorage.setItem('loggedInProvider', JSON.stringify(normalized));                                                                           
            sessionStorage.setItem('activeProvider', JSON.stringify(normalized));                                                                             
          }
        }
      } catch (error: any) {
      }
    })();
    
    return () => { cancelled = true; };
  }, [authReady, authLoading, currentUser, token, loggedInProvider, activeProvider, setLoggedInProvider, setActiveProvider]);

  // Initialize session ONCE
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        
        // If we already have a user in storage, we're good
        if (currentUser) {
          // Still set authReady and authLoading even if we skip the fetch
          if (!cancelled) {
            setAuthReady(true);
            setAuthLoading(false);
          }
          return;
        }

        // Try to fetch user via your existing user_providers endpoint
        // We need an email to call it; get it from a known place
        const emailFromStorage =
          JSON.parse(sessionStorage.getItem('loggedInProvider') || 'null')?.attributes?.email ||
          JSON.parse(sessionStorage.getItem('loggedInProvider') || 'null')?.email ||
          null;

        if (!token || !emailFromStorage) {
          return;
        }


        // Extract user id for Authorization (matches your backend)
        let userId = null as null | string;
        
        // Check if token is already a user ID
        if (/^\d+$/.test(token)) {
          userId = token;
        } else {
          // Try to decode as JWT token
          try {
            const decoded = JSON.parse(atob(token));
            if (decoded?.id) userId = String(decoded.id);
          } catch {/* ignore */}
        }
        
        if (!userId) userId = JSON.parse(sessionStorage.getItem('loggedInProvider') || 'null')?.id?.toString?.() || null;
        if (!userId) {
          return;
        }

        const base = 'https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com';
        const resp = await fetch(`${base}/api/v1/providers/user_providers?user_email=${encodeURIComponent(emailFromStorage)}`, {
          headers: { 
            'Authorization': userId,
            'Content-Type': 'application/json' 
          },
        });

        if (resp.ok) {
          const data = await resp.json();
          
          if (data?.user?.id && data?.user?.role) {
            const u: CurrentUser = {
              id: Number(data.user.id),
              email: data.user.email,
              role: data.user.role,
              primary_provider_id: data.user.primary_provider_id ?? null,
              active_provider_id: data.user.active_provider_id ?? null,
            };
            if (!cancelled) {
              setCurrentUser(u);
            }
          }
          // You likely also set userProviders/activeProvider here as you already do
        } else {
        }
      } catch (error) {
      } finally {
        if (!cancelled) {
          setAuthReady(true);
          setAuthLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
    // Run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contextValue: AuthContextType = {
    token,
    setToken,
    isAuthenticated,
    userRole: currentUser?.role || '',  // <-- role now comes from currentUser
    currentUser,                        // <-- add this
    setCurrentUser,                     // <-- add this
    authReady,                          // <-- add this
    authLoading,                        // <-- add this
    loggedInProvider,
    setLoggedInProvider: (provider: any) => {
      setLoggedInProvider(provider);
      // sessionStorage.setItem("loggedInProvider", JSON.stringify(provider)); // This is now handled by setLoggedInProvider
    },
    logout,
    initializeSession,
    activeProvider,
    setActiveProvider,
    availableProviders: userProviders,
    setAvailableProviders: (providers: any[]) => setUserProvidersState(providers),
    switchActiveProvider: switchProvider,
    hasProviderAccess: (providerId: number) => userProviders.some(p => p.id === providerId),
    extractUserIdForAuth,
    // Add missing properties for backward compatibility
    userProviders,
    switchProvider,
    fetchUserProviders,
  };

  return (
    <>
      <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
      
      {/* Inactivity Modals */}
      <InactivityModal
        isOpen={showInactivityWarning}
        type="warning"
        countdown={inactivityCountdown}
        onClose={() => setShowInactivityWarning(false)}
      />
      
      <InactivityModal
        isOpen={showInactivityLogout}
        type="logout"
        onClose={() => setShowInactivityLogout(false)}
      />
    </>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};


