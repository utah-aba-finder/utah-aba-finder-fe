import React, {useState} from 'react'
import './LoginPage.css'
import notes from '../Assets/behaviorPlan.jpg'
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
        const [showPassword, setShorPassword] = useState(false);  

        const handleShowPassword = () => {
            setShorPassword(!showPassword);
        }

        return (
            <div className='loginWrapper'>
                <div className='loginContainer'>
                    <h1 className='loginImageText'>Provider Sign Up</h1>
                    <img src={notes} alt='notepad' className='loginImage' />
                    <form className='loginForm'>
                        <div className='input'>
                            {/* <label className='username' htmlFor='username'>Provider Name :</label> */}
                            <User className='userIcon'/>
                            <input type='text' id='username' name='username' placeholder='Provider Name'required />
                        </div>
                        <div className='input'> 
                            {/* <label className='email' htmlFor='email'>Email:</label> */}
                            <Mail className='mailIcon'/>
                            <input type='email' id='email' name='email' placeholder='Email'required />
                        </div>
                        <div className='input'>
                            {/* <label className='password' htmlFor='password'>Password:</label> */}
                            <Lock className='lockIcon'/>
                            <input type={showPassword ? 'text' : 'password'} placeholder='Password'id='password' name='password' required />
                            <button className='eyeButton'type='button' onClick={handleShowPassword}>
                                {showPassword ? <EyeOff className='eye'/> : <Eye className='eye'/>}
                            </button>
                        </div>
                        <div className="forgot-password">Forgot Password <span>Click Here!</span></div>
                        <div className="submit-container">
                            <button type='submit' className='loginButton'>Sign Up</button>
                            <button type='submit' className='loginButton'>Login</button>
                        </div>
                    </form>
                </div>
            </div>
        )
}