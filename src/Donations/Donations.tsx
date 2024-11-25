import React from 'react';
import donateBanner from '../Assets/donate.jpg';
import '../Donations/Donations.css';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './CheckoutForm'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const stripePromise = loadStripe('pk_live_51QLVtXJCAzcIvuNOwz9neiT1W3VFBfhOO1XwhxF44UsatLhu6ksdsuMqDjIbpnvzV89gidl2qWVbZRTEKxmBZDJE009Ya5sRCx');

const Donations = () => {
    return (
        <div>
            <div className='donateBannerContainer'>
                <img src={donateBanner} alt="Donate Banner" className='loginBanner' />
                <h1 className='donateBannerTitle'>Donate</h1>
            </div>
            <div className='donation-message'>
                <p>Thank you for your interest in donating to Autism Services Locator. We are a 501(c)(3) non-profit organization and all donations are tax-deductible and you will recieve a email receipt upon donation. Please note that we are not a licensed medical provider and cannot provide medical advice or services. We are a resource for parents or individuals seeking information about autism services. Your donations help us maintain our site and reach out to different providers to make sure we have the most up to date information.</p>
            </div>
            <div className='donateContainer'>


                <Elements stripe={stripePromise}>
                    <CheckoutForm />
                </Elements>
                <ToastContainer />
            </div>
        </div>
    );
};

export default Donations;