import React, { useState, useRef } from 'react';
import { useStripe, useElements, CardElement, CardElementComponent } from '@stripe/react-stripe-js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const CheckoutForm: React.FC = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [paymentType, setPaymentType] = useState<'one-time' | 'recurring' | 'quarterly' | 'yearly'>('one-time');
    const [donationAmount, setDonationAmount] = useState<number>(50);
    const [customAmount, setCustomAmount] = useState<string>('');
    const customAmountInputRef = useRef<HTMLInputElement>(null);
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [address1, setAddress1] = useState<string>('');
    const [address2, setAddress2] = useState<string>('');
    const [city, setCity] = useState<string>('');
    const [state, setState] = useState<string>('');
    const [zip, setZip] = useState<string>('');

    const handlePaymentTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPaymentType(event.target.value as 'one-time' | 'recurring' | 'quarterly' | 'yearly');
    };

    const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;

        if (value === 'custom') {
            setCustomAmount('');
            setDonationAmount(0);
            customAmountInputRef.current?.focus();
        } else {
            setDonationAmount(Number(value));
            setCustomAmount('');
        }
    };

    const handleCustomAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        if (/^\d*\.?\d{0,2}$/.test(value)) {
            setCustomAmount(value);
            setDonationAmount(Number(value) || 0);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!stripe || !elements) return;

        const cardElement = elements.getElement(CardElement);

        if (!cardElement) {
            toast.error('Card element not found. Please try again.');
            return;
        }

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });

        if (error) {
            console.error(error);
            toast.error('Payment failed. Please try again.');
        } else {
            console.log('Payment successful!', paymentMethod);
            toast.success(`Thank you for your ${paymentType} donation of $${donationAmount}!`);
        }
    };


    return (
        <form onSubmit={handleSubmit} className="checkoutForm">
            <h2 className="checkoutTitle">Support Our Mission</h2>
            <div className='checkoutDescription'>
                <p>
                    Thank you for your interest in donation! <br />
                    We are a non-profit organization that relies on the generosity and kindnessof people like you to continue our work.
                </p>
                <p>
                    If you have any questions about donating, please contact us at{' '}
                    <a href="mailto:utahabalocator@gmail.com">utahabalocator@gmail.com</a>.
                </p>
            </div>


            <div className="paymentTypeContainer">
                <h3>Select Donation Type</h3>

                <div className="paymentTypeContainer">
                    <select
                        id="paymentType"
                        value={paymentType}
                        onChange={(event) => setPaymentType(event.target.value as 'one-time' | 'recurring' | 'yearly')}
                        className="paymentTypeSelect"
                    >
                        <option value="one-time">One-Time Donation</option>
                        <option value="recurring">Monthly Donation</option>
                        <option value="yearly">Yearly Donation</option>
                    </select>
                </div>
            </div>

            <div className="amountSelectionContainer">
                <h3>Select Donation Amount</h3>
                <div className="amountOptions">
                    <label>
                        <input
                            type="radio"
                            value="25"
                            checked={donationAmount === 25}
                            onChange={handleAmountChange}
                        />
                        $25
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="50"
                            checked={donationAmount === 50}
                            onChange={handleAmountChange}
                        />
                        $50
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="100"
                            checked={donationAmount === 100}
                            onChange={handleAmountChange}
                        />
                        $100
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="250"
                            checked={donationAmount === 250}
                            onChange={handleAmountChange}
                        />
                        $250
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="custom"
                            checked={customAmount !== '' || donationAmount === 0}
                            onChange={handleAmountChange}
                        />
                        Custom Amount
                    </label>
                    <input
                        type="number"
                        placeholder="Enter custom amount (ex. 10.99)"
                        value={customAmount}
                        onChange={handleCustomAmountChange}
                        ref={customAmountInputRef}
                        className="customAmountInput"
                    />
                </div>
            </div>


            <CardElement className="cardElement" />


            <div className='donatorInfo'>
                <div className="donatorInputContainer">
                    <h3>Your Information</h3>

                    <label htmlFor="name">First Name<span className="required">*</span></label>
                    <input
                        type="text"
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter your first name"
                        required
                    />
                    <label htmlFor="name">Last Name<span className="required">*</span></label>
                    <input
                        type="text"
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter your last name"
                        required
                    />
                </div>

                <div className="donatorInputContainer">
                    <h3>Billing Address</h3>
                    <label htmlFor="address">Address<span className="required">*</span></label>
                    <input
                        type="text"
                        id="address1"
                        value={address1}
                        onChange={(e) => setAddress1(e.target.value)}
                        placeholder="Enter your billing address"
                        required
                    />
                    <label htmlFor="address2">Address 2</label>
                    <input
                        type="text"
                        id="address2"
                        value={address2}
                        onChange={(e) => setAddress2(e.target.value)}
                        placeholder="Enter your address 2"
                    />
                    <div className='cityZipContainer'>
                        <label htmlFor="city">City<span className="required">*</span></label>
                        <input
                            type="text"
                            id="city"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Enter your city"
                            required
                        />
                        <label htmlFor="zip">Zip Code<span className="required">*</span></label>
                        <input
                            type="text"
                            id="zip"
                            value={zip}
                            onChange={(e) => setZip(e.target.value)}
                            placeholder="Enter your zip code"
                            required
                        />
                    </div>

                    <label htmlFor="state">State<span className="required">*</span></label>
                    <select
                        id="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="stateSelect"
                        required
                    >
                        <option value="">Select your state</option>
                        <option value="AL">Alabama</option>
                        <option value="AK">Alaska</option>
                        <option value="AZ">Arizona</option>
                        <option value="AR">Arkansas</option>
                        <option value="CA">California</option>
                        <option value="CO">Colorado</option>
                        <option value="CT">Connecticut</option>
                        <option value="DE">Delaware</option>
                        <option value="FL">Florida</option>
                        <option value="GA">Georgia</option>
                        <option value="HI">Hawaii</option>
                        <option value="ID">Idaho</option>
                        <option value="IL">Illinois</option>
                        <option value="IN">Indiana</option>
                        <option value="IA">Iowa</option>
                        <option value="KS">Kansas</option>
                        <option value="KY">Kentucky</option>
                        <option value="LA">Louisiana</option>
                        <option value="ME">Maine</option>
                        <option value="MD">Maryland</option>
                        <option value="MA">Massachusetts</option>
                        <option value="MI">Michigan</option>
                        <option value="MN">Minnesota</option>
                        <option value="MS">Mississippi</option>
                        <option value="MO">Missouri</option>
                        <option value="MT">Montana</option>
                        <option value="NE">Nebraska</option>
                        <option value="NV">Nevada</option>
                        <option value="NH">New Hampshire</option>
                        <option value="NJ">New Jersey</option>
                        <option value="NM">New Mexico</option>
                        <option value="NY">New York</option>
                        <option value="NC">North Carolina</option>
                        <option value="ND">North Dakota</option>
                        <option value="OH">Ohio</option>
                        <option value="OK">Oklahoma</option>
                        <option value="OR">Oregon</option>
                        <option value="PA">Pennsylvania</option>
                        <option value="RI">Rhode Island</option>
                        <option value="SC">South Carolina</option>
                        <option value="SD">South Dakota</option>
                        <option value="TN">Tennessee</option>
                        <option value="TX">Texas</option>
                        <option value="UT">Utah</option>
                        <option value="VT">Vermont</option>
                        <option value="VA">Virginia</option>
                        <option value="WA">Washington</option>
                        <option value="WV">West Virginia</option>
                        <option value="WI">Wisconsin</option>
                        <option value="WY">Wyoming</option>
                    </select>


                </div>
            </div>

            <button type="submit" disabled={!stripe} className="donateButton">
                Donate Now
            </button>
        </form>
    );
};

export default CheckoutForm;