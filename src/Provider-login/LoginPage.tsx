import React, {useState} from 'react'
import './LoginPage.css'
import notes from '../Assets/behaviorPlan.jpg'
import { User, Mail, Lock, Eye, EyeOff, MessageCircleMore } from 'lucide-react';

export const LoginPage: React.FC = () => {
        const [showPassword, setShorPassword] = useState(false);  
        const [action, setAction] = useState('Provider Sign Up');
        const handleShowPassword = () => {
            setShorPassword(!showPassword);
        }

        return (
            <div className='loginWrapper'>
                <div className='loginContainer'>
                    <h1 className='loginImageText'>{action}</h1>
                    <img src={notes} alt='notepad' className='loginImage' />
                    <form className='loginForm'>
                        {action === 'Provider Login' ? <div></div> :  <div className='input'>
                            <User className='userIcon'/>
                            <input type='text' id='username' name='username' placeholder='Provider Name'required />
                        </div>}
                        <div className='input'> 
                            <Mail className='mailIcon'/>
                            <input type='email' id='email' name='email' placeholder='Email'required />
                        </div>
                        {action === 'Provider Sign Up' ? <div className='input'><MessageCircleMore /><textarea placeholder="Tell us who you are and why you're interested in signing up" className='signupMessage'/></div> : <div className='input'>
                            <Lock className='lockIcon'/>
                            <input type={showPassword ? 'text' : 'password'} placeholder='Password'id='password' name='password' required />
                            <button className='eyeButton'type='button' onClick={handleShowPassword}>
                                {showPassword ? <EyeOff className='eye'/> : <Eye className='eye'/>}
                            </button>
                        </div>}
                        
                        {action === 'Provider Sign Up' ? <div></div> :                         <div className="forgot-password">Forgot Password <span>Click Here!</span></div>}
                        <div className="submit-container">
                            <button type='submit' className={action === 'Provider Sign Up' ? 'loginButton gray' : 'loginButton'} onClick={()=> setAction('Provider Sign Up')}>Sign Up</button>
                            <button type='submit' className={action === 'Provider Login' ? 'loginButton gray' : 'loginButton'} onClick={()=> setAction('Provider Login')}>Login</button>
                        </div>
                    </form>
                </div>
            </div>
        )
}