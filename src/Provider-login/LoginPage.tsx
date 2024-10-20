import React, { useState, useEffect } from 'react'
import './LoginPage.css'
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { MockProviderData, ProviderAttributes } from '../Utility/Types';
import { useAuth } from './AuthProvider';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import gearImage from '../Assets/Gear@1x-0.5s-200px-200px.svg';
import { fetchSingleProvider } from '../Utility/ApiCall';
import loginBanner from '../Assets/behaviorPlan.jpg'
import { useNavigate } from 'react-router-dom';

export const LoginPage: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [currentProvider, setCurrentProvider] = useState<MockProviderData | undefined>();
    const { setToken, setLoggedInProvider, logout } = useAuth();
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
            sessionStorage.setItem('authToken', token);
            setToken(token);

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
                    console.error('Provider ID not found');
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
            console.error('Login error:', err);
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
            if (err) {
                toast.error('Failed to login. Please check your username and password and try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleProviderUpdate = (updatedProvider: ProviderAttributes) => {
        setCurrentProvider((prevProvider) => {
            if (!prevProvider) return undefined;
            return {
                ...prevProvider,
                ...updatedProvider,
            };
        });
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
            <div className='loginBannerContainer'>
            <img src={loginBanner} alt="Login Banner" className='loginBanner' />
                <h1 className='loginImageText'>Provider Login</h1>
            </div>
            <ToastContainer />
            <div className='loginContainer'>
                <form className='loginForm' onSubmit={handleLogin}>
                    <div className='input'>
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
                    {error && <p className="error-message">Username or password incorrect, try again.</p>}
                    <div className="submit-container">
                        <button type='submit' id='signup' className='signupButton' onClick={() => toast("Feature coming soon")}>Sign Up</button>
                        <button type='submit' id='login' className='loginButton'>Login</button>
                    </div>
                </form>
            </div>
        </div>
    );
}