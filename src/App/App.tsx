import React from "react";
import "./App.css";
import { Routes, Route, useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Homepage from "../Homepage/Homepage";
import InformationPage from "../Information-page/InformationPage";
import { LoginPage } from "../Provider-login/LoginPage";
import ProvidersPage from "../Providers-page/ProvidersPage";
import { ScreeningPage } from "../Screening-page/ScreeningPage";
import { Screening2 } from "../Screening2/Screening2";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import Donations from "../Donations/Donations";
import { PageNotFound } from "../PageNotFound/PageNotFound";
import ContactUs from "../ContactUs/ContactUs";
import AboutUs from "../AboutUs/AboutUs";
import ProviderEdit from "../Provider-edit/ProviderEdit";
import { AuthProvider, useAuth } from "../Provider-login/AuthProvider";
import { useEffect, useState, useRef } from "react";
import ProtectedRoute from "../Provider-login/ProtectedRoute";
import {
  ProviderData,
  Providers,
  ProviderAttributes,
} from "../Utility/Types";
import SuperAdmin from "../SuperAdmin/SuperAdmin";
import Resources from "../Resources/Resources";
import { fetchPublicProviders } from "../Utility/ApiCall";
import { SuperAdminEdit } from "../SuperAdmin/SuperAdminEdit";
import FavoriteProviders from "../FavoriteProviders-page/FavoriteProviders";
import ServiceDisclaimer from "../Footer/servicedisclaimer";
import Careers from "../Footer/Careers";
import { handleMobileIssues } from "../Utility/cacheUtils";
import GoogleDebugTest from "../Providers-page/GoogleDebugTest";
import SimpleMapsDebug from "../Providers-page/SimpleMapsDebug";
import SimpleMapTest from "../Providers-page/SimpleMapTest";
import MobileDebugTest from "../Providers-page/MobileDebugTest";
import PasswordReset from "../PasswordReset/PasswordReset";
import ForgotPassword from "../ForgotPassword/ForgotPassword";
import ProviderDashboard from "../Utility/ProviderDashboard";
import ProviderSignup from "../ProviderSignup/ProviderSignup";
import ProviderWalkthrough from "../ProviderSignup/ProviderWalkthrough";
import TawkToWidget from "../Utility/TawkToWidget";
import SponsorLanding from "../Sponsorship/SponsorLanding";

// Simple test component to check if React loads
const TestComponent = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>React App is Loading!</h1>
      <p>If you can see this, the React app is working.</p>
      <p>Time: {new Date().toLocaleString()}</p>
    </div>
  );
};

// Safe Header wrapper that only renders when AuthProvider is ready
const SafeHeader = () => {
  return <Header />;
};

function App() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loggedInProvider, setLoggedInProvider] =
    useState<ProviderData | null>(null);
  const [allProviders, setAllProviders] = useState<ProviderData[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const clearProviderData = () => {
    setLoggedInProvider(null);
  };

  // Mobile-specific cache clearing and error handling
  useEffect(() => {
    try {
      // Only run this once per browser session, not on every page load
      if (localStorage.getItem('mobileIssuesHandled')) {
        console.log('🔄 App: Mobile issues already handled this session, skipping');
        return;
      }
      
      localStorage.setItem('mobileIssuesHandled', 'true');
      console.log('🔄 App: Handling mobile issues (first time only)');
      
      // Use the utility function to handle mobile issues
      handleMobileIssues();

      // Only reload for specific cache-related errors, not all errors
      const originalError = console.error;
      console.error = (...args) => {
        // Only reload for specific cache issues, not all errors
        if (args[0] && typeof args[0] === 'string' && 
            (args[0].includes('Failed to load') || args[0].includes('under construction'))) {
          // Add a flag to prevent infinite reloads
          if (!localStorage.getItem('reloadAttempted')) {
            console.log('⚠️ App: Cache error detected, attempting reload');
            localStorage.setItem('reloadAttempted', 'true');
            setTimeout(() => {
              console.log('🔄 App: Force reloading due to cache error');
              window.location.reload();
            }, 1000);
          } else {
            console.log('⚠️ App: Reload already attempted, not reloading again');
          }
        }
        originalError.apply(console, args);
      };
    } catch (error) {
      console.error('❌ App: Error in mobile issue handling:', error);
    }
  }, []);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const fetchAllProviders = async () => {
      try {
        const providers: Providers = await fetchPublicProviders();
        // Add null check and fallback for data property
        const data = providers?.data || [];
        setAllProviders(data);
      } catch (error) {

        // Don't let provider fetch errors break the app
        // Set empty array to prevent undefined errors
        setAllProviders([]);
      }
    };
    fetchAllProviders();
  }, []);

  const handleProviderUpdate = (updatedProvider: ProviderAttributes) => {
    try {
      setAllProviders((prevProviders) => {
        // Find the provider to update
        const providerIndex = prevProviders.findIndex(
          (provider) => provider.id === updatedProvider.id
        );
        
        if (providerIndex === -1) {
          return prevProviders; // Return unchanged if provider not found
        }
        
        // Create updated providers array
        const updatedProviders = [...prevProviders];
        updatedProviders[providerIndex] = {
          ...updatedProviders[providerIndex],
          attributes: {
            ...updatedProvider,
            // Ensure locations are preserved
            locations: updatedProvider.locations || updatedProviders[providerIndex].attributes.locations || []
          }
        };
        
        return updatedProviders;
      });
    } catch (error) {
      
      // Don't let the error break the UI
    }
  };

  return (
    <div className="App">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {!isOnline && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: '#ff6b6b',
          color: 'white',
          textAlign: 'center',
          padding: '8px',
          zIndex: 9999,
          fontSize: '14px'
        }}>
          ⚠️ No internet connection. Some features may not work properly.
        </div>
      )}
      
      <AuthProvider>
        <SafeHeader /> 
        <div className="main-content">
          <Routes>
            <Route path="/test" element={<TestComponent />} />
            <Route path="/" element={<Homepage />} />
            <Route path="/information" element={<InformationPage />} />
            <Route path="/providers" element={<ProvidersPage />} />
            <Route path="/screening" element={<ScreeningPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/screening/cast" element={<Screening2 />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/provider-signup" element={<ProviderSignup />} />
            <Route path="/provider-walkthrough" element={<ProviderWalkthrough />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/favoriteproviders" element={<FavoriteProviders />} />
            <Route path="/donate" element={<Donations />} />
            <Route path="/sponsor" element={<SponsorLanding />} />
            <Route path="/servicedisclaimer" element={<ServiceDisclaimer />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/google-debug" element={<GoogleDebugTest />} />
            <Route path="/maps-debug" element={<SimpleMapsDebug />} />
            <Route path="/map-test" element={<SimpleMapTest />} />
            <Route path="/mobile-debug" element={<MobileDebugTest />} />
            <Route path="/reset-password" element={<PasswordReset />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            <Route
              path="/superAdmin/edit/:id"
              element={
                <ProtectedRoute allowedRoles={["super_admin"]}>
                  <SuperAdminEditWrapper
                    providers={allProviders}
                    onUpdate={handleProviderUpdate}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/superAdmin"
              element={
                <ProtectedRoute allowedRoles={["super_admin"]}>
                  <SuperAdmin />
                </ProtectedRoute>
              }
            />

            <Route
              path="/providerEdit/:id"
              element={
                <ProtectedRoute
                  allowedRoles={["provider_admin", "super_admin"]}
                >
                  <ProviderEditWrapper
                    clearProviderData={clearProviderData}
                    onUpdate={handleProviderUpdate}
                  />
                </ProtectedRoute>
              }
            />
            
            {/* Provider Management Dashboard */}
            <Route
              path="/my-providers"
              element={
                <ProtectedRoute allowedRoles={["provider_admin", "super_admin"]}>
                  <div className="min-h-screen bg-gray-50 pt-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                      <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Provider Management</h1>
                        <p className="mt-2 text-gray-600">
                          Manage all your providers and switch between them easily
                        </p>
                      </div>
                      <ProviderDashboard showQuickActions={true} showProviderList={true} />
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
            
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </div>
        <Footer />
        <TawkToWidget 
          widgetId="1j0pk77o9"
          visitorName={undefined}
          visitorEmail={undefined}
        />
      </AuthProvider>
    </div>
  );
}
function SuperAdminEditWrapper({
  providers,
  onUpdate,
}: {
  providers: ProviderData[];
  onUpdate: (updatedProvider: ProviderAttributes) => void;
}) {
  const { providerId } = useParams();
  const provider = providers.find(p => p.id === (providerId ?? 0));

  if (!provider) {
    return <div>Provider not found</div>;
  }

  return (
    <SuperAdminEdit
      provider={provider}
      onUpdate={onUpdate}
    />
  );
}

function ProviderEditWrapper({
  clearProviderData,
  onUpdate,
}: {
  clearProviderData: () => void;
  onUpdate: (updatedProvider: ProviderAttributes) => void;
}) {
      const { loggedInProvider, activeProvider, authReady, authLoading, currentUser, logout } = useAuth();                                                                                                                                        
  const { id } = useParams<{ id: string }>();
  const [isRestoring, setIsRestoring] = useState(false);
  const restorationStartedRef = useRef(false);
  const restorationFailedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function to clear all timers
  const clearRestorationTimers = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // If we still don't have a provider but we have a user and an ID in the URL,
  // give the restoration logic a moment to complete (max 2 seconds)
  // NOTE: This must be before any early returns to satisfy React Hooks rules
  useEffect(() => {
    if (!authReady || authLoading) {
      clearRestorationTimers();
      return;
    }
    
    // Check sessionStorage directly to avoid stale closures
    const hasProviderInState = activeProvider || loggedInProvider;
    const hasProviderInStorage = 
      JSON.parse(sessionStorage.getItem('activeProvider') || 'null') ||
      JSON.parse(sessionStorage.getItem('loggedInProvider') || 'null');
    const hasProvider = hasProviderInState || hasProviderInStorage;
    
    // If we have a provider, clear restoration state
    if (hasProvider) {
      if (isRestoring) {
        setIsRestoring(false);
      }
      restorationStartedRef.current = false;
      restorationFailedRef.current = false; // Reset failed flag if we have a provider
      clearRestorationTimers();
      return;
    }
    
    // Only start restoration check if we don't have a provider AND haven't started restoring yet
    // AND restoration hasn't already failed
    if (!hasProvider && currentUser && id && !restorationStartedRef.current && !restorationFailedRef.current) {
      restorationStartedRef.current = true;
      setIsRestoring(true);
      console.warn('ProviderEditWrapper: No provider in state, but user is authenticated and URL has ID:', id);
      
      // Clear any existing timers first
      clearRestorationTimers();
      
      // Give restoration logic time to complete (check periodically)
      // Check sessionStorage directly since state values might be stale in closure                                                                             
      intervalRef.current = setInterval(() => {
        // Check if provider was restored (read from sessionStorage to get latest values)                                                                       
        const restoredFromStorage = 
          JSON.parse(sessionStorage.getItem('activeProvider') || 'null') ||
          JSON.parse(sessionStorage.getItem('loggedInProvider') || 'null');
        
        if (restoredFromStorage) {
          console.log('✅ ProviderEditWrapper: Provider restored from storage, clearing loading state');                                                        
          setIsRestoring(false);
          restorationStartedRef.current = false;
          restorationFailedRef.current = false; // Reset failed flag on success
          clearRestorationTimers();
        }
      }, 200);

      // Stop checking after 2 seconds - if provider isn't restored by then, give up                                                                            
      timeoutRef.current = setTimeout(() => {
        console.log('⚠️ ProviderEditWrapper: Restoration timeout - provider not restored after 2 seconds');                                                      
        setIsRestoring(false);
        restorationStartedRef.current = false;
        restorationFailedRef.current = true; // Mark as failed so we don't try again
        clearRestorationTimers();
      }, 2000);
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      // Don't clear timers here - let them run to completion
      // Only clear on unmount
    };
  }, [authReady, authLoading, currentUser, id, activeProvider, loggedInProvider]);

  // Failsafe: If restoration has been in progress for more than 3 seconds, force clear it
  useEffect(() => {
    if (!isRestoring) return;
    
    const failsafeTimeout = setTimeout(() => {
      console.error('⚠️ ProviderEditWrapper: Failsafe triggered - forcing loading state to clear after 3 seconds');
      setIsRestoring(false);
      restorationStartedRef.current = false;
      restorationFailedRef.current = true;
      // Clear timers directly in failsafe
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }, 3000);
    
    return () => clearTimeout(failsafeTimeout);
  }, [isRestoring]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearRestorationTimers();
    };
  }, []);

  // Wait for auth to initialize before checking login state
  if (!authReady || authLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
        <div>Loading…</div>
      </div>
    );
  }

  // CRITICAL: If user is authenticated, prioritize sessionStorage to prevent "Please log in" screen
  // when navigating between tabs
  const isAuthenticated = currentUser !== null && currentUser !== undefined;
  
  // Check sessionStorage first if user is authenticated (more reliable during navigation)
  let providerToUse: ProviderData | null = null;
  if (isAuthenticated) {
    // First try sessionStorage (most reliable during tab navigation)
    const fromStorage = 
      JSON.parse(sessionStorage.getItem('activeProvider') || 'null') ||
      JSON.parse(sessionStorage.getItem('loggedInProvider') || 'null');
    
    if (fromStorage) {
      providerToUse = fromStorage;
    } else {
      // Fall back to state
      providerToUse = activeProvider || loggedInProvider || null;
    }
  } else {
    // If not authenticated, use state only
    providerToUse = activeProvider || loggedInProvider || null;
  }
  
  // Show loading state while restoration might be in progress (but only if user is authenticated)
  if (!providerToUse && isRestoring && isAuthenticated) {
    return (
      <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '1rem' }}>Loading provider data...</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
            This should only take a moment
          </p>
        </div>
      </div>
    );
  }

  // Only show "Please log in" if user is NOT authenticated
  // If user IS authenticated, we should have provider data from sessionStorage
  // But if for some reason we don't, allow ProviderEdit to handle it gracefully
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ marginBottom: '1rem', fontSize: '1.125rem', color: '#374151' }}>
            Please log in to edit provider information.
          </p>
        </div>
      </div>
    );
  }

  // If authenticated but still no provider data, create a minimal provider object
  // This allows ProviderEdit to render and fetch the real data via refreshProviderData
  // This should rarely happen if sessionStorage is working correctly
  if (!providerToUse && isAuthenticated && id) {
    console.warn('⚠️ ProviderEditWrapper: Authenticated but no provider data found, creating temporary provider object');
    providerToUse = {
      id: parseInt(id || '0'),
      type: 'Provider',
      states: [],
      attributes: {
        id: parseInt(id || '0'),
        states: [],
        password: '',
        username: '',
        name: '',
        email: '',
        website: null,
        logo: null,
        provider_type: [],
        insurance: [],
        counties_served: [],
        locations: [],
        cost: null,
        min_age: null,
        max_age: null,
        waitlist: null,
        telehealth_services: null,
        spanish_speakers: null,
        at_home_services: null,
        in_clinic_services: null,
        updated_last: null,
        status: null,
        in_home_only: false,
        service_delivery: { in_home: false, in_clinic: false, telehealth: false }
      }
    };
  }
  
  // Final safety check - if still no provider, don't render ProviderEdit
  if (!providerToUse) {
    console.error('❌ ProviderEditWrapper: Cannot render - no provider data available');
    return (
      <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ marginBottom: '1rem', fontSize: '1.125rem', color: '#374151' }}>
            Unable to load provider data. Please try refreshing the page.
          </p>
          {currentUser && (
            <button
              onClick={() => {
                logout('manual');
                clearProviderData();
              }}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Clear Session and Re-login
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <ProviderEdit
      loggedInProvider={providerToUse}
      clearProviderData={clearProviderData}
      onUpdate={onUpdate}
    />
  );
}

export default App;
