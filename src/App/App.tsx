import './App.css';
import { Routes, Route } from 'react-router-dom';
import Homepage from '../Homepage/Homepage';
import InformationPage from '../Information-page/InformationPage';
import { LoginPage } from '../Provider-login/LoginPage';
import ProvidersPage from '../Providers-page/ProvidersPage';
import { ScreeningPage } from '../Screening-page/ScreeningPage';
import { Screening2 } from '../Screening2/Screening2';
import Header from '../Header/Header'
import Footer from '../Footer/Footer'
import { PageNotFound } from '../PageNotFound/PageNotFound';
import ContactUs from '../ContactUs/ContactUs';
import { Signup } from '../Signup/Signup';
import AboutUs from '../AboutUs/AboutUs';
import ProviderEdit from '../Provider-edit/ProviderEdit';
import { AuthProvider, useAuth } from '../Provider-login/AuthProvider';
function App() {
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
            <Route path='/providerLogin' element={<LoginPage />} />
            <Route path='/contact' element={<ContactUs />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='/about' element={<AboutUs />} />
            <Route path='/providerEdit' element={<ProviderEditWrapper />} />
            <Route path='*' element={<PageNotFound />} />
          </Routes>
        </AuthProvider>
      </header>
      <Footer />
    </div>
  );
}
function ProviderEditWrapper() {
  const { loggedInProvider } = useAuth();
  return <ProviderEdit loggedInProvider={loggedInProvider} />;
}

export default App;