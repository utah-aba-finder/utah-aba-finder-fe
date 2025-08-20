import React, { useState, useEffect } from 'react'
import './LoginPage.css'
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { fetchSingleProvider } from '../Utility/ApiCall';
import { useNavigate } from 'react-router-dom';

export const LoginPage: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [showInactivityMessage, setShowInactivityMessage] = useState(false);
    const { initializeSession, setLoggedInProvider, setCurrentUser, currentUser } = useAuth();
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



    // Reactive navigation when auth state is ready
    useEffect(() => {
        if (!currentUser) return;
        
        console.log('🚀 Login: Auth state ready, navigating based on role:', currentUser.role);
        setIsRedirecting(true);
        
        if (currentUser.role === 'super_admin') {
            console.log('🚀 Login: Navigating super admin to /superAdmin');
            navigate('/superAdmin', { replace: true });
        } else if (currentUser.role === 'provider_admin') {
            const providerId = currentUser.active_provider_id || currentUser.primary_provider_id;
            if (providerId) {
                console.log('🚀 Login: Navigating provider to /providerEdit/' + providerId);
                navigate(`/providerEdit/${providerId}`, { replace: true });
            } else {
                console.log('🚀 Login: No provider ID, navigating to /contact');
                navigate('/contact', { replace: true });
            }
        }
    }, [currentUser, navigate]);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('🔍 Login: Form submitted');
        
        // Prevent double submission
        if (isLoading) {
            console.log('❌ Login: Already loading, preventing double submission');
            return;
        }
        
        console.log('🔍 Login: Starting login process for:', username);
        setError('');
        setIsLoading(true);



        try {
            console.log('📡 Login: Making API call to login endpoint');
            const requestBody = {
                user: {
                    email: username,
                    password: password
                }
            };
            console.log('📡 Login: Request body:', { email: username, password: '***' });
            
            const response = await fetch('https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody),
            });
            
            console.log('📡 Login: API response status:', response.status);
            console.log('📡 Login: API response headers:', Object.fromEntries(response.headers.entries()));
            
            const data = await response.json();
            console.log('📡 Login: API response data:', data);

            if (!response.ok) {
                console.log('❌ Login: API returned error status:', response.status);
                let errorMessage = 'Login failed';
                if (response.status === 401) {
                    errorMessage = 'Invalid email or password';
                } else if (data.error) {
                    errorMessage = data.error;
                }

                console.log('❌ Login: Error message:', errorMessage);
                throw new Error(errorMessage);
            }
            
            console.log('✅ Login: API call successful');



            // Check for Authorization header first
            const authHeader = response.headers.get('Authorization');
            console.log('🔑 Login: Authorization header:', authHeader);
            let token = null;
            
            if (authHeader) {
                token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
                console.log('🔑 Login: Using Authorization header token');
            } else {
                // If no Authorization header, create a session token from user data
                token = btoa(JSON.stringify(data.user)); // Base64 encode user data as temporary token
                console.log('🔑 Login: Created base64 token from user data');
            }
            
            console.log('🔑 Login: Final token (preview):', token ? `${token.substring(0, 20)}...` : 'none');
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
                
                // Update AuthProvider state
                setCurrentUser(currentUserData);
                console.log('🔐 Login: Updated AuthProvider currentUser state:', currentUserData);
                
                console.log('🎉 Login: Success toast for super admin');
                toast.success(`Welcome back, ${data.user.email}!`);
            } else if (userRole === 'provider_admin') {
                const providerId = data.user?.provider_id;
                
                // Set currentUser immediately for proper auth context and navigation
                const currentUserData = {
                    id: data.user.id,
                    email: data.user.email,
                    role: userRole,
                    primary_provider_id: providerId || null,
                    active_provider_id: data.user.active_provider_id || providerId || null,
                };
                
                // Save to session storage and update context
                sessionStorage.setItem('currentUser', JSON.stringify(currentUserData));
                setCurrentUser(currentUserData);
                console.log('🔐 Login: Updated AuthProvider currentUser state for provider:', currentUserData);
                
                if (providerId && providerId !== null) {
                    try {
                        const providerDetails = await fetchSingleProvider(providerId);
                        setLoggedInProvider({
                            ...providerDetails,
                            role: 'provider_admin'
                        });
                        console.log('🎉 Login: Success toast for provider admin');
                        toast.success(`Welcome back, ${providerDetails.attributes.name}!`);
                    } catch (error) {
                        console.log('⚠️ Login: Failed to load provider details, but auth state will still trigger navigation');
                        setLoggedInProvider({
                            ...data.user,
                            role: 'provider_admin'
                        });
                        toast.error('Error loading provider details. Please contact support.');
                        // Navigation will still be handled by the useEffect based on currentUser
                    }
                } else {
                    // For users without a provider_id, show an error
                    console.log('⚠️ Login: No provider ID found, auth state will trigger navigation to contact');
                    setLoggedInProvider({
                        ...data.user,
                        role: 'provider_admin'
                    });
                    toast.error('Account configuration error: No provider ID found. Please contact support.');
                    // Navigation will be handled by the useEffect based on currentUser
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





    return (
        <div className='loginWrapper'>
            {/* Loading Overlay */}
            {(isLoading || isRedirecting) && (
                <div className="loading-overlay">
                    <div className="loading-content">
                        <div className="loading-spinner"></div>
                        <h3>{isLoading ? 'Logging you in...' : 'Redirecting...'}</h3>
                        <p>
                            {isLoading 
                                ? 'Please wait while we authenticate your account.' 
                                : 'Please wait while we redirect you to your dashboard.'
                            }
                        </p>
                        <div className="loading-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
            )}
            
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
                        <button type='submit' id='login' className='loginButton'>Login</button>
                    </div>
                </form>
            </div></div>
    );
}