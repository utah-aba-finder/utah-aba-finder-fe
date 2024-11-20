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