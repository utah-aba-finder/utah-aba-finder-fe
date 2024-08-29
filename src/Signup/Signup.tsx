import { User, Mail, MessageCircleMore, StickyNote, LockKeyhole, MoveDown, FilePenLine } from 'lucide-react';
import './Signup.css';
import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { toast, ToastContainer } from 'react-toastify';

interface EmailJSResponse {
  text: string;
  status: number;
}

export const Signup = () => {
  const [provider, setProvider] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

const submitInquiry = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const templateParams = {
    provider: provider,
    message: message,
    email: email
  }

  setIsLoading(true);
  emailjs.send('service_d6byt4s','template_rdrgmli', templateParams, 'YtcUeRrOLBFogwZI7')
  .then((res: EmailJSResponse) => {
      toast.success(`Email sent successfully!, ${res.text}`);
      setEmail('');
      setProvider('');
      setMessage('');
      setIsLoading(false);
    })
    .catch((err: any) => { 
      toast.error(`Error sending email, ${err}`);
      setIsLoading(false);
    });
}

if(isLoading) {
    toast.info('Sending email...');
}
  return (
    <section className='signupWrapper'>
        <ToastContainer />
        <div className='signupContainer'>
            <h1 className='signupImageText'>Provider Sign Up</h1>
        
            <form className='signupForm' onSubmit={submitInquiry}> <div className='input'>
            <User className='userIcon'/>
                    <input type='text' id='username' name='username' value={provider} placeholder='Provider Name'required onChange={(e) => setProvider(e.target.value)}/>
                </div>
                <div className='input'> 
                    <Mail className='mailIcon'/>
                    <input type='email' id='email' name='email' placeholder='Email'
                    required value={email}
                    onChange={(e) => setEmail(e.target.value)}/>
                </div>
                    <div className='input'><MessageCircleMore className='textIcon' /><textarea placeholder="Tell us who you are and why you're interested in signing up" className='signupMessage'
                    value={message}
                    onChange={(e)=> setMessage(e.target.value)}/></div> 
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
            <div className='downArrow'><MoveDown className='arrow1'/></div>
            <div className='step2'>
                <div className='iconContainer'>
                    <StickyNote className='instructionIcons'/>
                </div>
                <div className='messageContainer'>
                <p>Admin will review your info and request some type of proof to confirm ownership as well as send a form to gather data</p>
                </div>
            </div>
                <div className='downArrow'><MoveDown className='arrow2'/></div>
            <div className='step3'>
                <div className='iconContainer'>
                    <LockKeyhole className='instructionIcons'/>
                </div>
                <div className='messageContainer'>
            <p>Admin will provide a temporary password and initiliaze your information</p>
            </div>
            </div>
            <div className='downArrow'><MoveDown className='arrow3'/></div>
            <div className='step4'>
                <div className='iconContainer'>
                <FilePenLine className='instructionIcons'/>
                </div>
                <div className='messageContainer'>
                <p>As a provider you can now update your information as often as needed!</p>
                </div>
            </div>
        </section>
        </div>
    </section>
  )
}