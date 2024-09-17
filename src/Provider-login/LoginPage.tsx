import React, {useState, useEffect} from 'react'
import './LoginPage.css'
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ProviderAttributes, Location } from '../Utility/Types';
import  ProviderEdit  from '../Provider-edit/ProviderEdit'
import { Insurance } from '../Utility/Types';
import { MockProviderData, MockProviders } from '../Utility/Types';
import { useAuth } from './AuthProvider';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import gearImage from '../Assets/Gear@1x-0.5s-200px-200px.svg';


export const LoginPage: React.FC = () => {
        const [showPassword, setShowPassword] = useState(false);  
        const [username, setUsername] = useState('');
        const [password, setPassword] = useState('');
        const [error, setError] = useState('');
        const [isLoading, setIsLoading] = useState(false)
        const navigate = useNavigate();

        const [isLoggedIn, setIsLoggedIn] = useState(false);
        const [currentProvider, setCurrentProvider] = useState<ProviderAttributes | undefined>();
        const { setToken } = useAuth();
        const [showError, setShowError] = useState(false);

        useEffect(() => {
            if (error) {
                setShowError(true);
                const timer = setTimeout(() => setShowError(false), 3000);
                return () => clearTimeout(timer);
            }
        }, [error]);
    
        const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setError('');

            try {
                const response = await fetch('https://c9d8bfc6-16f1-40be-9dff-f69da7621219.mock.pstmn.io/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user: {
                        email: username,
                        password: password
                        }
                }),
        });
        
        const responseText = await response.text();
        console.log('Response Text:', responseText);
        console.log('Response Status:', response.status);
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.log('Response is not JSON:', responseText);
            data = { message: responseText };
        }

        if (response.ok) {
            // if (data.token) {
            setIsLoading(true)
                setIsLoggedIn(true);
                setCurrentProvider(data.data);
                // setToken(data.token);
                navigate('/providerEdit');
            // } else {
            //     toast.error("Login successful, but no token received.");
            // }
        } else {
            const errorMessage = data.Error || data.message || `Login failed. Status: ${response.status}`;
            setError(errorMessage);
            toast.error(errorMessage);
            setIsLoading(false)
        }
    } catch (err) {
        console.error('Login error:', err);
        toast.error(`An error occurred. Please try again. Details: ${err}`);
    }
}

        const handleShowPassword = () => {
            setShowPassword(!showPassword);
        }
        if(isLoading){
            <div className="loading-container">
                <img src={gearImage} alt="Loading..." className="loading-gear" />
            </div>
        }

        return (
        
            <div className='loginWrapper'>
                <ToastContainer />
            {!isLoggedIn ? 
                <div className='loginContainer'>
                    <h1 className='loginImageText'>Provider Login</h1>
                    <form  className='loginForm' onSubmit={handleLogin}>
                        <div className='input'>
                            <User className='userIcon'/>
                            <input type='text' id='username' name='username' placeholder='User Name'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)} required />
                        </div>
                        <div className='input'>
                            <Lock className='lockIcon'/>
                            <input type={showPassword ? 'text' : 'password'} placeholder='Password' id='password' name='password' value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required />
                            <button className='eyeButton' type='button' onClick={handleShowPassword}>
                                {showPassword ? <EyeOff className='eye'/> : <Eye className='eye'/>}
                            </button>
                        </div>
                        <div className="forgot-password">Forgot Password <span>Click Here!</span></div>
                        <div className="submit-container">
                            <button type='submit' id='signup' className='loginButton' disabled={true}>Sign Up</button>
                            <button type='submit' id='login' className='loginButton'>Login</button>
                        </div>
                    </form>
                </div> : (currentProvider && <ProviderEdit loggedInProvider={currentProvider} />)} 
                    
            </div>
        )
}