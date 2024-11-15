import React from 'react';
import donateBanner from '../Assets/donate.jpg';
import '../Donations/Donations.css';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './CheckoutForm'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const stripePromise = loadStripe('pk_live_51QIvIqP3ILzRu6hwdkygmm4Mob9eFQ6LkOdWJWSX6yqwKv7jqZ92vKE3kZGchkjHME4oLHxMQ6pDDCuG4YvbpHxh004XhCi7RQ');

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