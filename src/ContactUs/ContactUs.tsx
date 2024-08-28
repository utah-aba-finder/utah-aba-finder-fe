import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ContactUs.css';
import teamBanner from '../Assets/team-banner.webp';

const ContactUs: React.FC = () => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!email.includes('@') || !email.includes('.com')) {
            toast.error('Please enter a valid email address with "@" and ".com"');
            return;
        }

    };

    return (
        <div className='contact-page'>
            <ToastContainer />
            <div className='contact-banner'>
                <img src={teamBanner} className='contact-banner-pic' alt="Team Banner" />
                <h1 className='contact-banner-title'>Contact Us</h1>
            </div>
            <div className='contact-input-container'>
                <input placeholder='Your name' className='contact-input-name' />
                <input
                    placeholder='Your e-mail address'
                    className='contact-input-email'
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input placeholder='Message' className='contact-input-message' />
                <button className='contact-page-button' onClick={handleSubmit}> Send
                </button>
            </div>
        </div>
    );
}

export default ContactUs;