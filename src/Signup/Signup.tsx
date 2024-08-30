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
        emailjs.send('service_d6byt4s', 'template_rdrgmli', templateParams, 'YtcUeRrOLBFogwZI7')
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

    if (isLoading) {
        toast.info('Sending email...');
    }
    return (
        <section className='signupWrapper'>
            <ToastContainer />
            <div className='signupContainer'>
                <h1 className='signupImageText'>Provider Sign Up</h1>

                <form className='signupForm' onSubmit={submitInquiry}> <div className='input'>
                    <User className='userIcon' />
                    <input type='text' id='username' name='username' value={provider} placeholder='Provider Name' required onChange={(e) => setProvider(e.target.value)} />
                </div>
                    <div className='input'>
                        <Mail className='mailIcon' />
                        <input type='email' id='email' name='email' placeholder='Email'
                            required value={email}
                            onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className='input'><MessageCircleMore className='textIcon' /><textarea placeholder="Tell us who you are and why you're interested in signing up" className='signupMessage'
                        value={message}
                        onChange={(e) => setMessage(e.target.value)} /></div>
                    <button type='submit' className='loginButton' >Sign Up</button>

                </form>
                <section className='signupInstructions'>
                    <h1>How It Works</h1>
                    <div className="instructionContainer">
                        <div className="iconColumn">
                            <Mail className="instructionIcon1" />
                            <MoveDown className="arrow1" />
                            <StickyNote className="instructionIcon2" />
                            <MoveDown className="arrow2" />
                            <LockKeyhole className="instructionIcon3" />
                            <MoveDown className="arrow3" />
                            <FilePenLine className="instructionIcon4" />
                        </div>
                        <div className="messageColumn">
                            <p className='step1'>Email your information</p>
                            <p className='step2'>Admin will review your info and request some type of proof to confirm ownership as well as send a form to gather data</p>
                            <p className='step3'>Admin will provide a temporary password and initiliaze your information</p>
                            <p className='step4'>As a provider you can now update your information as often as needed!</p>
                        </div>
                    </div>
                </section>
            </div>
        </section>
    )
}
