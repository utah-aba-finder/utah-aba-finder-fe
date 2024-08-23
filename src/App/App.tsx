import './App.css';
import { Routes, Route } from 'react-router-dom';
import Homepage from '../Homepage/Homepage';
import InformationPage from '../Information-page/InformationPage';
import LoginPage from '../Login-page/LoginPage';
import ProvidersPage from '../Providers-page/ProvidersPage';
import {ScreeningPage} from '../Screening-page/ScreeningPage';
import {Screening1} from '../Screening1/Screening1';
import {Screening2} from '../Screening2/Screening2';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Routes>
          <Route path='/' element={<Homepage />} />
          <Route path='/information' element={<InformationPage />} />
          <Route path='/providers' element={<ProvidersPage />} />
          <Route path='/screening'  element={<ScreeningPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/screening/m-chat' element={<Screening1 />} />
          <Route path='/screening/cast' element={<Screening2 />} />
          <Route path='*' element={<div>404: Page Not Found.</div>} />
        </Routes>      
        </header>
    </div>
  );
}

export default App;