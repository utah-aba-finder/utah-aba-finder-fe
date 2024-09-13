import React, {useState} from 'react'
import './LoginPage.css'
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProviderAttributes } from '../Utility/Types';

export const LoginPage: React.FC = () => {
        const [showPassword, setShowPassword] = useState(false);  
        const [username, setUsername] = useState('');
        const [password, setPassword] = useState('');
        const [error, setError] = useState('');

        const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setError('');

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });

                if (response.ok) {
                    const data = await response.json();
                    // Handle successful login (e.g., store token, redirect)
                    console.log('Login successful', data);
                } else {
                    setError('Invalid username or password');
                }
            } catch (err) {
                setError('An error occurred. Please try again.');
                console.error('Login error:', err);
            }
        };

        const handleShowPassword = () => {
            setShowPassword(!showPassword);
        }

        return (
            <div className='loginWrapper'>
                <div className='loginContainer'>
                    <h1 className='loginImageText'>Provider Login</h1>
                    <form onSubmit={handleLogin} className='loginForm'> <div className='input'>
                            <User className='userIcon'/>
                            <input type='text' id='username' name='username' placeholder='User Name'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}required />
                        </div>
                         <div className='input'>
                            <Lock className='lockIcon'/>
                            <input type={showPassword ? 'text' : 'password'} placeholder='Password'id='password' name='password' value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required />
                            <button className='eyeButton'type='button' onClick={handleShowPassword}>
                                {showPassword ? <EyeOff className='eye'/> : <Eye className='eye'/>}
                            </button>
                        </div>
                                <div className="forgot-password">Forgot Password <span>Click Here!</span></div>
                        <div className="submit-container">
                            {/* <Link to='/signup' id='signup' className= 'loginButton' >Sign Up</Link> */}
                            <button type='submit' id='login' className= 'loginButton' >Login</button>
                        </div>
                    </form>
                </div>
            </div>
        )
}