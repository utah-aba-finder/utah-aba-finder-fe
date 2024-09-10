import React, {useState} from 'react'
import './LoginPage.css'
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LoginPage: React.FC = () => {
        const [showPassword, setShowPassword] = useState(false);  


        const handleShowPassword = () => {
            setShowPassword(!showPassword);
        }

        return (
            <div className='loginWrapper'>
                <div className='loginContainer'>
                    <h1 className='loginImageText'>Provider Login</h1>
                    <form className='loginForm'> <div className='input'>
                            <User className='userIcon'/>
                            <input type='text' id='username' name='username' placeholder='User Name'required />
                        </div>
                         <div className='input'>
                            <Lock className='lockIcon'/>
                            <input type={showPassword ? 'text' : 'password'} placeholder='Password'id='password' name='password' required />
                            <button className='eyeButton'type='button' onClick={handleShowPassword}>
                                {showPassword ? <EyeOff className='eye'/> : <Eye className='eye'/>}
                            </button>
                        </div>
                                <div className="forgot-password">Forgot Password <span>Click Here!</span></div>
                        <div className="submit-container">
                            <Link to='/signup' id='signup' className= 'loginButton' >Sign Up</Link>
                            <button type='submit' id='login' className= 'loginButton' >Login</button>
                        </div>
                    </form>
                </div>
            </div>
        )
}