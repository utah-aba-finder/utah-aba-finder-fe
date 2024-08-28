import { User, Mail, MessageCircleMore, StickyNote, LockKeyhole, MoveDown } from 'lucide-react';
import './Signup.css';
import notes from '../Assets/behaviorPlan.jpg';

export const Signup = () => {
  return (
    <section className='signupWrapper'>
        <div className='signupContainer'>
            <h1 className='signupImageText'>Provider Sign Up</h1>
            <img src={notes} alt='notepad' className='loginImage' />
        
            <form className='signupForm'> <div className='input'>
            <User className='userIcon'/>
                    <input type='text' id='username' name='username' placeholder='Provider Name'required />
                </div>
                <div className='input'> 
                    <Mail className='mailIcon'/>
                    <input type='email' id='email' name='email' placeholder='Email'required />
                </div>
                    <div className='input'><MessageCircleMore /><textarea placeholder="Tell us who you are and why you're interested in signing up" className='signupMessage'/></div> 
                    <button type='submit' className= 'loginButton' >Sign Up</button>

            </form>
        <section className='signupInstructions'>
            <h1>How It Works</h1>
            <div className='step1'>
                <div className='iconContainer'>
                    <Mail className='instructionIcons'/>
                </div>
                <div className='messageContainer'>
                    <p>Email your information</p>
                </div>
            </div>
            <div className='downArrow'><MoveDown className='arrow'/></div>
            <div className='step2'>
                <div className='iconContainer'>
                    <StickyNote className='instructionIcons'/>
                </div>
                <div className='messageContainer'>
                <p>Admin will review your info and request some type of proof to confirm ownership as well as send a form to gather data</p>
                </div>
            </div>
                <div className='downArrow'><MoveDown className='arrow'/></div>
            <div className='step3'>
                <div className='iconContainer'>
                    <LockKeyhole className='instructionIcons'/>
                </div>
                <div className='messageContainer'>
            <p>Admin will provide a temporary password and initiliaze your information</p>
            </div>
            </div>
        </section>
        </div>
    </section>
  )
}
