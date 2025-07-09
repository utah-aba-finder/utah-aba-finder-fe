import React, { useState, useEffect } from 'react'
import './LoginPage.css'
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import gearImage from '../Assets/Gear@1x-0.5s-200px-200px.svg';
import { fetchSingleProvider } from '../Utility/ApiCall';
import { useNavigate } from 'react-router-dom';

export const LoginPage: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showInactivityMessage, setShowInactivityMessage] = useState(false);
    const { initializeSession, setLoggedInProvider } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // Check for logout reason on component mount
    useEffect(() => {
        const logoutReason = sessionStorage.getItem("logoutReason");
        if (logoutReason === 'inactivity' || logoutReason === 'session-expired') {
            setShowInactivityMessage(true);
            // Clear the logout reason so it doesn't show again
            sessionStorage.removeItem("logoutReason");
        }
    }, []);

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
            
            const data = await response.json();

            if (!response.ok) {
                let errorMessage = 'Login failed';
                if (response.status === 401) {
                    errorMessage = 'Invalid email or password';
                } else if (data.error) {
                    errorMessage = data.error;
                }

                throw new Error(errorMessage);
            }

            const authHeader = response.headers.get('Authorization');
            if (!authHeader) {
                throw new Error('No Authorization header found in response');
            }

            const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
            initializeSession(token);

            if (data.data.role === 'super_admin') {
                setLoggedInProvider(data.data);
                navigate('/superAdmin');
            } else if (data.data.role === 'provider_admin') {
                const providerId = data.data?.provider_id;
                if (providerId) {
                    const providerDetails = await fetchSingleProvider(providerId);
                    setLoggedInProvider({
                        ...providerDetails,
                        role: 'provider_admin'
                    });
                    toast.info('You are logged in as ' + providerDetails.attributes.name)
                    navigate(`/providerEdit/${providerId}`);
                } else {
                    toast.error('Provider ID not found');
                    throw new Error('Provider ID not found');
                }
            } else {
                toast.error('Unknown user role');
                throw new Error('Unknown user role');
            }

            setUsername('');
            setPassword('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
            if (err) {
                toast.error('Failed to login. Please check your username and password and try again.');
            }
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



    return (
        <div className='loginWrapper'>
            {showInactivityMessage && (
                <div className="inactivity-message">
                    <div className="inactivity-message-content">
                        <h3>Session Expired</h3>
                        <p>Your session has expired. Please log in again to continue.</p>
                        <button 
                            type="button" 
                            onClick={() => setShowInactivityMessage(false)}
                            className="inactivity-message-close"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
            <div className='loginContainer'>
                <form className='loginForm' onSubmit={handleLogin}>
                    <h2 className='loginFormTitle'>Provider Login</h2>
                    <div className='login-input'>
                        <User className='userIcon' />
                        <input
                            type='email'
                            id='username'
                            name='username'
                            placeholder='User Name'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className='login-input'>
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
                        {showPassword ? 
                            <EyeOff className='eye' onClick={handleShowPassword} role="button" tabIndex={0} /> : 
                            <Eye className='eye' onClick={handleShowPassword} role="button" tabIndex={0} />
                        }
                    </div>
                    {error && <p className="error-message">Username or password incorrect, try again.</p>}
                    <div className="submit-container">
                        <button type='button' id='signup' className='signupButton' onClick={() => navigate('/signup')}>Sign Up</button>
                        <button type='submit' id='login' className='loginButton'>Login</button>
                    </div>
                </form>
            </div></div>
    );
}