import React, { useState, useEffect } from 'react'
import './LoginPage.css'
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MockProviderData, ProviderAttributes } from '../Utility/Types';
import ProviderEdit from '../Provider-edit/ProviderEdit'
import { useAuth } from './AuthProvider';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import gearImage from '../Assets/Gear@1x-0.5s-200px-200px.svg';
import { fetchSingleProvider } from '../Utility/ApiCall';

export const LoginPage: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentProvider, setCurrentProvider] = useState<MockProviderData | undefined>();
    const { setToken } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
    
        try {
            const response = await fetch('https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/login', {
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
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.message || 'Login failed');
            }
    
            const authHeader = response.headers.get('Authorization');
            if (!authHeader) {
                throw new Error('No Authorization header found in response');
            }
    
            const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
            sessionStorage.setItem('authToken', token);
            setToken(token);
    
            const data = await response.json();
            console.log('LINE 66:', data);
    
            const providerId = data.data.provider_id;
            if (providerId) {
                const providerDetails = await fetchSingleProvider(providerId);
                setCurrentProvider(providerDetails);
                setIsLoggedIn(true);
                setUsername('');
                setPassword('');
            } else {
                throw new Error('Provider ID not found');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
            toast.error(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };
    

    const handleShowPassword = () => {
        setShowPassword(!showPassword);
    }

    if (isLoading) {
        return (
            <div className="loading-container">
                <img src={gearImage} alt="Loading..." className="loading-gear" />
                <p>Loading...</p>
            </div>
        );
    }

    console.log('currentProvider from login page', currentProvider)
    const clearProviderData = () => {
        setIsLoggedIn(false);
        setCurrentProvider(undefined);
    };
    return (
        <div className='loginWrapper'>
            <ToastContainer />
            {!isLoggedIn ? (
                <div className='loginContainer'>
                    <h1 className='loginImageText'>Provider Login</h1>
                    <form className='loginForm' onSubmit={handleLogin}>
                        <div className='input'>
                            <User className='userIcon' />
                            <input
                                type='text'
                                id='username'
                                name='username'
                                placeholder='User Name'
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className='input'>
                            <Lock className='lockIcon' />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder='Password'
                                id='password'
                                name='password'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button className='eyeButton' type='button' onClick={handleShowPassword}>
                                {showPassword ? <EyeOff className='eye' /> : <Eye className='eye' />}

                            </button>
                        </div>
                        <div className="forgot-password">Forgot Password <span>Click Here!</span></div>
                        <div className="submit-container">
                            <button type='submit' id='signup' className='loginButton' disabled={true}>Sign Up</button>
                            <button type='submit' id='login' className='loginButton'>Login</button>
                        </div>
                    </form>
                </div>
            ) : (
                currentProvider && <ProviderEdit loggedInProvider={currentProvider} clearProviderData={clearProviderData} />
            )}
        </div>
    );
}