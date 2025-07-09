import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
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

        emailjs.sendForm('service_b9y8kte', 'template_a2x7i2h', form.current!, '1FQP_qM9qMVxNGTmi')
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
            <div className='contact-banner'>
                <img src={teamBanner} className='contact-banner-pic' alt="Team Banner" />
                <h1 className='contact-banner-title'>Contact Us</h1>
            </div>
            <div className="contact-content">
                <div className='contact-us-text'>
                    <p>If you have any questions or feedback, please feel free to contact us using the form below.</p>
                    <p>Or feel free to call us at <a href="tel:1(801)833-0284" className='contact-us-phone-number'>(801)833-0284</a></p>
                    <p>Don't want to use the form? Email us at <a href="mailto:info@autismserviceslocator.com" className='contact-us-email'>info@autismserviceslocator.com</a></p>
                    <p>Looking to be added to our database? Email us at <a href="mailto:registration@autismserviceslocator.com" className='contact-us-email'>registration@autismserviceslocator.com</a></p>
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
        </div>
    );
}

export default ContactUs;