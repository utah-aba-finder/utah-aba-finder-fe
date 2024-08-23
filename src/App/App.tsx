import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Homepage from '../Homepage/Homepage';
import InformationPage from '../Information-page/InformationPage';
import LoginPage from '../Login-page/LoginPage';
import ProvidersPage from '../Providers-page/ProvidersPage';
import ScreeningPage from '../Screening-page/ScreeningPage';
import Header from '../Header/Header'
import Footer from '../Footer/Footer'

function App() {
  return (
    <div className="App">
      <Header />
      <header className="App-header">
        <Routes>
          <Route path='/' element={<Homepage />} />
          <Route path='/information' element={<InformationPage />} />
          <Route path='/providers' element={<ProvidersPage />} />
          <Route path='/screening' element={<ScreeningPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='*' element={<div>404: Page Not Found.</div>} />
        </Routes>
      </header>
      <Footer />
    </div>
  );
}

export default App;
