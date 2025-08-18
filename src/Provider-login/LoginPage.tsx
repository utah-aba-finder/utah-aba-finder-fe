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
        
        console.log('🔐 Login attempt started', { username, password: password ? '***' : 'empty' });
        
        // Check form validation
        if (!username || !password) {
            console.log('🔐 Form validation failed:', { username: !!username, password: !!password });
            setError('Please fill in all fields');
            return;
        }
        
        // Prevent double submission
        if (isLoading) {
            console.log('🔐 Login blocked - already loading');
            return;
        }
        
        setError('');
        setIsLoading(true);



        try {
            console.log('🔐 Making API call to login endpoint');
            const response = await fetch('https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/login', {
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
            console.log('🔐 API response received:', { status: response.status, ok: response.ok });
            
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



            // Check for Authorization header first
            const authHeader = response.headers.get('Authorization');
            let token = null;
            
            if (authHeader) {
                token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
            } else {
                // If no Authorization header, create a session token from user data
                token = btoa(JSON.stringify(data.user)); // Base64 encode user data as temporary token
            }
            
            initializeSession(token);

            // Map role numbers to role strings - handle both string and numeric roles
            let userRole = 'unknown';
            
            if (typeof data.user.role === 'string') {
                // Backend returns string roles directly
                userRole = data.user.role;
            } else if (typeof data.user.role === 'number') {
                // Backend returns numeric roles that need mapping
                const roleMap: { [key: number]: string } = {
                    0: 'super_admin',      // Backend clarified: 0 is Superadmin
                    1: 'provider_admin'    // Backend clarified: 1 is Provider Admin
                };
                userRole = roleMap[data.user.role] || 'unknown';
            }
            
            console.log('🔐 Login: User role determined:', { 
                originalRole: data.user.role, 
                mappedRole: userRole,
                userData: data.user 
            });

            
            if (userRole === 'super_admin') {
                setLoggedInProvider(data.user);
                
                // Set currentUser immediately for proper auth context
                const currentUserData = {
                    id: data.user.id,
                    email: data.user.email,
                    role: userRole,
                    primary_provider_id: data.user.primary_provider_id || null,
                    active_provider_id: data.user.active_provider_id || null,
                };
                
                // Save to session storage and update context
                sessionStorage.setItem('currentUser', JSON.stringify(currentUserData));
                
                navigate('/superAdmin');
            } else if (userRole === 'provider_admin') {
                const providerId = data.user?.provider_id;
                
                // Debug: Log the user data to see what we're getting
                

                
                if (providerId && providerId !== null) {
                    try {
                        const providerDetails = await fetchSingleProvider(providerId);
                        setLoggedInProvider({
                            ...providerDetails,
                            role: 'provider_admin'
                        });
                        toast.info('You are logged in as ' + providerDetails.attributes.name)
                        navigate(`/providerEdit/${providerId}`);
                    } catch (error) {

                        setLoggedInProvider({
                            ...data.user,
                            role: 'provider_admin'
                        });
                        toast.error('Error loading provider details. Please contact support.');
                        navigate('/');
                    }
                } else {
                    // For users without a provider_id, show an error and redirect to contact page
                    setLoggedInProvider({
                        ...data.user,
                        role: 'provider_admin'
                    });
                    toast.error('Account configuration error: No provider ID found. Please contact support.');
                    navigate('/contact'); // Redirect to contact page instead of non-existent route
                }
            } else {
                toast.error('Unknown user role');
                throw new Error('Unknown user role');
            }

            setUsername('');
            setPassword('');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
            setError(errorMessage);
            
            // Provide more specific error messages
            if (errorMessage.includes('Invalid email or password')) {
                toast.error('Invalid email or password. Please try again.');
            } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
                toast.error('Network error. Please check your connection and try again.');
            } else if (errorMessage.includes('Provider ID not found')) {
                toast.error('Account configuration error. Please contact support.');
            } else {
                toast.error('Login failed. Please try again.');
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
                    
                    {/* Forgot Password Link */}
                    <div className="forgot-password-container">
                        <button 
                            type="button" 
                            className="forgot-password-link"
                            onClick={() => navigate('/forgot-password')}
                        >
                            Forgot Password?
                        </button>
                    </div>
                    
                    <div className="submit-container">
                        <button type='button' id='signup' className='signupButton' onClick={() => navigate('/provider-signup')}>Sign Up</button>
                        <button type='submit' id='login' className='loginButton' onClick={() => console.log('🔐 Login button clicked')}>Login</button>
                    </div>
                </form>
            </div></div>
    );
}