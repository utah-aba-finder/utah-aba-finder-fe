import React from 'react';
import donateBanner from '../Assets/donate.jpg';
import '../Donations/Donations.css';
import { Elements } from '@stripe/react-stripe-js';
import { Appearance, loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import CheckoutForm from './CheckoutForm'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PayPallLink from 'src/Assets/qrcode.png'
import VenmoLink from 'src/Assets/venmo.jpeg'

const stripePromise = loadStripe('pk_live_51QLVtXJCAzcIvuNOwz9neiT1W3VFBfhOO1XwhxF44UsatLhu6ksdsuMqDjIbpnvzV89gidl2qWVbZRTEKxmBZDJE009Ya5sRCx', {
    apiVersion: '2020-08-27',
});

const appearance: Appearance = {
    theme: 'stripe',
    variables: {
        colorPrimary: '#28a745',
    },
};

const options: StripeElementsOptions = {
    appearance,
    paymentMethodCreation: 'manual' as const,
};

const Donations = () => {
    return (
        <div>
            <div className='donateBannerContainer'>
                <img src={donateBanner} alt="Help Us Grow Banner" className='loginBanner' />
                <h1 className='donateBannerTitle'>Help Us Grow</h1>
            </div>
            <div className='donateContent'>
                <h2>Support Our Mission to Expand Autism Services</h2>
                <p><strong>Help Us Grow</strong> and join us in expanding our directory and outreach to serve more families in the autism community.</p>
                <p>Your support helps us:</p>
                <ul>
                    <li>Hire part-time staff to expand our provider directory</li>
                    <li>Reach more families across the United States</li>
                    <li>Improve our platform and services</li>
                    <li>Provide better support to the autism community</li>
                </ul>
                <p>Donations are tax-deductible and you will receive an email receipt upon completion. Please note that we are not a licensed medical provider and cannot offer direct medical advice or services.</p>
                <p>By supporting us, you're helping families navigate the complex world of autism resources more easily. Your contribution allows us to:</p> <ul> <li>Maintain our comprehensive database of local providers</li> <li>Continuously update information to reflect current best practices</li> <li>Expand our reach to support even more families</li> </ul>
                <p>You are also helping us to continue to provide this service for free and also create another resource for individuals to connect with other like minded individuals and create/host events near them! Lookout for our site/application <strong>Neurodiversity Friends!</strong></p>
                <p><strong>Donate Now</strong> and join us in making a difference in the autism community.</p>
                <p>You can also donate via <strong>PayPal</strong> or <strong>Venmo</strong> by scanning the QR code below or by clicking the link below if you have any issues with the other options.</p>
                <p>If you'd like to send it by mail you can send it to our P.O. Box: <br/> <strong>Autism Services Locator, 50, Riverton, UT, 84065</strong></p>
            </div>
            <div className='donateContainer'>
                <Elements stripe={stripePromise} options={options}>
                    <CheckoutForm />
                </Elements>
                <ToastContainer />
                <div className='paypalContainer'>
                    <img src={PayPallLink} alt="PayPal QR Code" className='paypalLink' />
                    <a href='https://paypal.me/asl2024' target="_blank" rel="noopener noreferrer">
                        Click here to donate via PayPal
                    </a>
                </div>
                <div className='venmoContainer'>
                    <img src={VenmoLink} alt="Venmo QR Code" className='venmoLink' />
                    <a href='https://venmo.com/AutismServicesLocator' target="_blank" rel="noopener noreferrer">
                        Click here to donate via Venmo
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Donations;