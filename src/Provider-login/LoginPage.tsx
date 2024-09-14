import React, {useState} from 'react'
import './LoginPage.css'
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProviderAttributes as ProviderAttributesType, Location } from '../Utility/Types';
import  ProviderEdit  from '../Provider-edit/ProviderEdit'
import { Insurance } from '../Utility/Types';
import { MockProviderData, MockProviders } from '../Utility/Types';

export const LoginPage: React.FC = () => {
        const [showPassword, setShowPassword] = useState(false);  
        const [username, setUsername] = useState('');
        const [password, setPassword] = useState('');
        const [error, setError] = useState('');
        // Mock data for providers
        const mockProviders: ProviderAttributesType[] = [
            {
                id: 1,
                name: "Dr. John Doe",
                username: "johndoe",
                password: "password123",
                email: "john.doe@example.com",
                locations: [
                    {
                        name: "Main Clinic",
                        address_1: "123 Main St",
                        address_2: "Suite 100",
                        city: "Anytown",
                        state: "ST",
                        zip: "12345",
                        phone: "123-456-7890"
                    }
                ],
                website: "https://www.johndoe.com",
                cost: "$100-$150 per session",
                insurance: [],
                counties_served: [],
                min_age: 5,
                max_age: 18,
                waitlist: "2-3 weeks",
                telehealth_services: "Yes",
                spanish_speakers: "No",
                at_home_services: "No",
                in_clinic_services: "Yes",
                logo: "https://example.com/logo.png"
            },
            {
                id: 2,
                name: "Dr. Jane Smith",
                username: "janesmith",
                password: "securepass456",
                email: "jane.smith@example.com",
                locations: [
                    {
                        name: "Downtown Office",
                        address_1: "456 Oak Ave",
                        address_2: "",
                        city: "Metropolis",
                        state: "ST",
                        zip: "67890",
                        phone: "987-654-3210"
                    }
                ],
                website: "https://www.janesmith.com",
                cost: "$80-$120 per session",
                insurance: [],
                counties_served: [],
                min_age: 3,
                max_age: 21,
                waitlist: "1 week",
                telehealth_services: "Yes",
                spanish_speakers: "Yes",
                at_home_services: "Yes",
                in_clinic_services: "Yes",
                logo: "https://example.com/logo2.png"
            }
        ];

        const [isLoggedIn, setIsLoggedIn] = useState(false);
        const [currentProvider, setCurrentProvider] = useState<ProviderAttributesType | undefined>();

        const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setError('');
    
            try {
                // For demonstration purposes, we'll use mock data instead of actual API call
                // Remove this line when implementing real API calls
                const mockResponse = { ok: true, json: () => Promise.resolve({ provider: mockProviders.find(p => p.username === username && p.password === password) }) };
    
                // Replace 'mockResponse' with 'response' when using actual API
                if (mockResponse.ok) {
                    const data = await mockResponse.json();
                    if (data.provider) {
                        setCurrentProvider(data.provider);
                        setIsLoggedIn(true);
                        console.log('Login successful', data.provider);
                    } else {
                        setError('Invalid username or password');
                    }
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
                    <form onSubmit={handleLogin} className='loginForm'>
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
                    {/* {isLoggedIn && currentProvider ? (
                        <ProviderEdit loggedInProvider={currentProvider} />
                    ) : (
                        error && <div className="error-message">{error}</div>
                    )} */}
                </div>
            </div>
        )
}