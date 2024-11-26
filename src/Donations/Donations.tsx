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
                <p>Thank you for your interest in supporting Autism Services Locator. We are a 501(c)(3) non-profit organization dedicated to connecting families with autism services. Your donation helps us maintain our free resource platform, ensuring up-to-date information for those seeking support.</p>
                <p>Donations are tax-deductible and you will receive an email receipt upon completion. Please note that we are not a licensed medical provider and cannot offer direct medical advice or services.</p>
                <p>By supporting us, you're helping families navigate the complex world of autism resources more easily. Your contribution allows us to:</p> <ul> <li>Maintain our comprehensive database of local providers</li> <li>Continuously update information to reflect current best practices</li> <li>Expand our reach to support even more families</li> </ul>
                <p><strong>Donate Now</strong> and join us in making a difference in the autism community.</p>
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