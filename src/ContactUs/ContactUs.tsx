import React, { useState, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ContactUs.css';
import emailjs from 'emailjs-com';
import teamBanner from '../Assets/team-banner.webp';

const ContactUs: React.FC = () => {
    const [email, setEmail] = useState('');
    const form = useRef<HTMLFormElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.includes('@') || !email.includes('.com')) {
            toast.error('Please enter a valid email address with "@" and ".com"');
            return;
        }

        emailjs.sendForm('service_d6byt4s', 'template_sbg2v56', form.current!, 'YtcUeRrOLBFogwZI7')
            .then((result) => {
                toast.success('Email sent successfully');
            }, (error) => {
                toast.error('Error sending email');
            });

        form.current!.reset();
        setEmail('');
    };

    return (
        <div className='contact-page'>
            <ToastContainer />
            <div className='contact-banner'>
                <img src={teamBanner} className='contact-banner-pic' alt="Team Banner" />
                <h1 className='contact-banner-title'>Contact Us</h1>
            </div>
            <div className='contact-us-text'>
                <p>If you have any questions or feedback, please feel free to contact us using the form below.</p>
                <p>Or feel free to call us at <a href="tel:1(385)560-4481" className='contact-us-phone-number'>(385) 560-4481</a></p>
            </div>
            <form ref={form} className='contact-input-container' onSubmit={handleSubmit}>
                <input name="user_name" placeholder='Your name' className='contact-input-name' required />
                <input
                    name="user_email"
                    placeholder='Your e-mail address'
                    className='contact-input-email'
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <textarea name="message" placeholder='Message' className='contact-input-message' required />
                <button className='contact-page-button' type="submit">Send</button>
            </form>
        </div>
    );
}

export default ContactUs;