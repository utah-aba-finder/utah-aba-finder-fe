import './App.css';
import { Routes, Route, useParams } from 'react-router-dom';
import Homepage from '../Homepage/Homepage';
import InformationPage from '../Information-page/InformationPage';
import { LoginPage } from '../Provider-login/LoginPage';
import ProvidersPage from '../Providers-page/ProvidersPage';
import { ScreeningPage } from '../Screening-page/ScreeningPage';
import { Screening2 } from '../Screening2/Screening2';
import Header from '../Header/Header'
import Footer from '../Footer/Footer'
import Donations from '../Donations/Donations';
import { PageNotFound } from '../PageNotFound/PageNotFound';
import ContactUs from '../ContactUs/ContactUs';
import { Signup } from '../Signup/Signup';
import AboutUs from '../AboutUs/AboutUs';
import ProviderEdit from '../Provider-edit/ProviderEdit';
import { AuthProvider, useAuth } from '../Provider-login/AuthProvider';
import { useEffect, useState } from 'react';
import ProtectedRoute from '../Provider-login/ProtectedRoute';
import { MockProviderData, MockProviders, ProviderAttributes } from '../Utility/Types';
import { SuperAdmin } from '../SuperAdmin/SuperAdmin';
import Resources from '../Resources/Resources';
import { fetchProviders } from '../Utility/ApiCall';
import { SuperAdminEdit } from '../SuperAdmin/SuperAdminEdit';
import FavoriteProviders from '../FavoriteProviders-page/FavoriteProviders'


function App() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loggedInProvider, setLoggedInProvider] = useState<MockProviderData | null>(null);
  const [allProviders, setAllProviders] = useState<MockProviderData[]>([])

  const clearProviderData = () => {
    setLoggedInProvider(null);
  };

  useEffect(() => {
    const fetchAllProviders = async () => {
      try {
        const providers: MockProviders = await fetchProviders()
        const data = providers.data
        setAllProviders(data)
      } catch (error) {
        console.error('Error fetching providers:', error)
      }
    }
    fetchAllProviders()
  }, [])

  const handleProviderUpdate = (updatedProvider: ProviderAttributes) => {
    setAllProviders(prevProviders =>
      prevProviders.map(provider =>
        provider.id === updatedProvider.id ? { ...provider, ...updatedProvider } : provider
      )
    );
  };   

  return (
    <div className="App">
      <Header />
      <header className="App-header">
        <AuthProvider>
          <Routes>
            <Route path='/' element={<Homepage />} />
            <Route path='/information' element={<InformationPage />} />
            <Route path='/providers' element={<ProvidersPage />} />
            <Route path='/screening' element={<ScreeningPage />} />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/screening/cast' element={<Screening2 />} />
            <Route path='/contact' element={<ContactUs />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='/about' element={<AboutUs />} />
            <Route path='/resources' element={<Resources />} />
            <Route path='/favoriteproviders' element={<FavoriteProviders />} />
            <Route path='/donate' element={<Donations />} />
            

            <Route path='/superAdmin/edit/:id' element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <SuperAdminEditWrapper providers={allProviders} onUpdate={handleProviderUpdate} />
              </ProtectedRoute>
            } />
            <Route path="/superAdmin" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <SuperAdmin />
              </ProtectedRoute>
            } />

            <Route path="/providerEdit/:id" element={
              <ProtectedRoute allowedRoles={['provider_admin', 'super_admin']}>
                <ProviderEditWrapper clearProviderData={clearProviderData} onUpdate={handleProviderUpdate} />
              </ProtectedRoute>
            } />
            <Route path='*' element={<PageNotFound />} />
          </Routes>
        </AuthProvider>
      </header>
      <Footer />
    </div>
  );
}
function SuperAdminEditWrapper({ providers, onUpdate }: { providers: MockProviderData[], onUpdate: (updatedProvider: ProviderAttributes) => void }) {
  const { providerId } = useParams();
  const provider = providers.find(p => p.id === (providerId ?? 0));

  if (!provider) {
    return <div>Provider not found</div>;
  }

  return <SuperAdminEdit provider={provider} onUpdate={onUpdate} />;
}
function ProviderEditWrapper({ clearProviderData, onUpdate, }: { clearProviderData: () => void, onUpdate: (updatedProvider: ProviderAttributes) => void}) {
  const { loggedInProvider } = useAuth();
  return <ProviderEdit loggedInProvider={loggedInProvider} clearProviderData={clearProviderData} onUpdate={onUpdate} />;
}

export default App;