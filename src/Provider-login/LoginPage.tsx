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

export const LoginPage: React.FC = () => {
        const [showPassword, setShowPassword] = useState(false);  
        const [username, setUsername] = useState('');
        const [password, setPassword] = useState('');
        const [error, setError] = useState('');
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

        if (response.ok) {
            try {
                const data = JSON.parse(responseText);
                if (data.token) {
                    setIsLoggedIn(true);
                    setCurrentProvider(data.provider);
                    console.log('Login successful', data.provider);
                    setToken(data.token); // Store the token
                    navigate('/providerEdit');
                } else {
                    toast.error("Invalid email or password. Please try again.");
                }
            } catch (parseError) {
                console.error('Error parsing response:', parseError);
                toast.error(`Unexpected response format. Please try again later.`);
            }
        } else {
            setError(`Login failed. Status: ${response.status}, Message: ${responseText}`);
            toast.error(`Login failed. Status: ${response.status}, Message: ${responseText}`);
        }
    } catch (err) {
        console.error('Login error:', err);
        toast.error(`An error occurred. Please try again. Details: ${err}`);
    }
}

        const handleShowPassword = () => {
            setShowPassword(!showPassword);
        }

        return (
            <div className='loginWrapper'>
                <ToastContainer />
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
                </div>
            </div>
        )
}