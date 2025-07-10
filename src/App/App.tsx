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
import { Signup } from "../Signup/Signup";
import AboutUs from "../AboutUs/AboutUs";
import ProviderEdit from "../Provider-edit/ProviderEdit";
import { AuthProvider, useAuth } from "../Provider-login/AuthProvider";
import { useEffect, useState } from "react";
import ProtectedRoute from "../Provider-login/ProtectedRoute";
import {
  ProviderData,
  Providers,
  ProviderAttributes,
} from "../Utility/Types";
import SuperAdmin from "../SuperAdmin/SuperAdmin";
import Resources from "../Resources/Resources";
import { fetchProviders } from "../Utility/ApiCall";
import { SuperAdminEdit } from "../SuperAdmin/SuperAdminEdit";
import FavoriteProviders from "../FavoriteProviders-page/FavoriteProviders";
import ServiceDisclaimer from "../Footer/servicedisclaimer";
import Careers from "../Footer/Careers";
import { handleMobileIssues } from "../Utility/cacheUtils";
import GoogleDebugTest from "../Providers-page/GoogleDebugTest";
import MobileDebugTest from "../Providers-page/MobileDebugTest";

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
      // Use the utility function to handle mobile issues
      handleMobileIssues();

      // Force reload if there are any console errors related to cached content
      const originalError = console.error;
      console.error = (...args) => {
        if (args[0] && typeof args[0] === 'string' && 
            (args[0].includes('Failed to load') || args[0].includes('under construction'))) {
          window.location.reload();
        }
        originalError.apply(console, args);
      };
    } catch (error) {
      console.error('Error in mobile cache handling:', error);
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
        const providers: Providers = await fetchProviders();
        const data = providers.data;
        setAllProviders(data);
      } catch (error) {
        console.error("Error fetching providers:", error);
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
      console.error('App: Error updating provider:', error);
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
      <Header /> 
      <div className="main-content">
        <AuthProvider>
          <Routes>
            <Route path="/test" element={<TestComponent />} />
            <Route path="/" element={<Homepage />} />
            <Route path="/information" element={<InformationPage />} />
            <Route path="/providers" element={<ProvidersPage />} />
            <Route path="/screening" element={<ScreeningPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/screening/cast" element={<Screening2 />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/favoriteproviders" element={<FavoriteProviders />} />
            <Route path="/donate" element={<Donations />} />
            <Route path="/servicedisclaimer" element={<ServiceDisclaimer />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/google-debug" element={<GoogleDebugTest />} />
            <Route path="/mobile-debug" element={<MobileDebugTest />} />
            
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
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </AuthProvider>
      </div>
      <Footer />
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
  const { id } = useParams();
  const providerId = id ? parseInt(id) : 0;
  const { loggedInProvider } = useAuth();

  if (!loggedInProvider) {
    return <div>Please log in to edit provider information.</div>;
  }

  return (
    <ProviderEdit
      loggedInProvider={loggedInProvider}
      clearProviderData={clearProviderData}
      onUpdate={onUpdate}
    />
  );
}

export default App;
