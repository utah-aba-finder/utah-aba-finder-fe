import React from 'react'
import notes from '../Assets/behaviorPlan.jpg'


export const LoginPage: React.FC = () => {


        return (
            <div className='loginWrapper'>
                <div className='loginImageContainer'>
                    <img src={notes} alt='notepad' className='loginImage' />
                    <h1 className='loginImageText'>Provider Login</h1>
                </div>
                <div className='loginContainer'>
                    <form className='loginForm'>
                        <label htmlFor='email'>Email:</label>
                        <input type='email' id='email' name='email' required />
                        <label htmlFor='password'>Password:</label>
                        <input type='password' id='password' name='password' required />
                        <button type='submit' className='loginButton'>Login</button>
                    </form>
                </div>
            </div>
        )
}