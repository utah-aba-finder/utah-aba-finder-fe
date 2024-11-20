import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

const CheckoutForm: React.FC = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [donationAmount, setDonationAmount] = useState<number | null>(50);
    const [customAmount, setCustomAmount] = useState<string>('');
    const [isCustomAmount, setIsCustomAmount] = useState<boolean>(false);
    const [frequency, setFrequency] = useState<'one-time' | 'recurring'>('one-time');
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [address1, setAddress1] = useState<string>('');
    const [address2, setAddress2] = useState<string>('');
    const [city, setCity] = useState<string>('');
    const [state, setState] = useState<string>('');
    const [zip, setZip] = useState<string>('');
    const [isPolicyChecked, setIsPolicyChecked] = useState<boolean>(false);

    const states = [
        { code: 'AL', name: 'Alabama' },
        { code: 'AK', name: 'Alaska' },
        { code: 'AZ', name: 'Arizona' },
        { code: 'AR', name: 'Arkansas' },
        { code: 'CA', name: 'California' },
        { code: 'CO', name: 'Colorado' },
        { code: 'CT', name: 'Connecticut' },
        { code: 'DE', name: 'Delaware' },
        { code: 'FL', name: 'Florida' },
        { code: 'GA', name: 'Georgia' },
        { code: 'HI', name: 'Hawaii' },
        { code: 'ID', name: 'Idaho' },
        { code: 'IL', name: 'Illinois' },
        { code: 'IN', name: 'Indiana' },
        { code: 'IA', name: 'Iowa' },
        { code: 'KS', name: 'Kansas' },
        { code: 'KY', name: 'Kentucky' },
        { code: 'LA', name: 'Louisiana' },
        { code: 'ME', name: 'Maine' },
        { code: 'MD', name: 'Maryland' },
        { code: 'MA', name: 'Massachusetts' },
        { code: 'MI', name: 'Michigan' },
        { code: 'MN', name: 'Minnesota' },
        { code: 'MS', name: 'Mississippi' },
        { code: 'MO', name: 'Missouri' },
        { code: 'MT', name: 'Montana' },
        { code: 'NE', name: 'Nebraska' },
        { code: 'NV', name: 'Nevada' },
        { code: 'NH', name: 'New Hampshire' },
        { code: 'NJ', name: 'New Jersey' },
        { code: 'NM', name: 'New Mexico' },
        { code: 'NY', name: 'New York' },
        { code: 'NC', name: 'North Carolina' },
        { code: 'ND', name: 'North Dakota' },
        { code: 'OH', name: 'Ohio' },
        { code: 'OK', name: 'Oklahoma' },
        { code: 'OR', name: 'Oregon' },
        { code: 'PA', name: 'Pennsylvania' },
        { code: 'RI', name: 'Rhode Island' },
        { code: 'SC', name: 'South Carolina' },
        { code: 'SD', name: 'South Dakota' },
        { code: 'TN', name: 'Tennessee' },
        { code: 'TX', name: 'Texas' },
        { code: 'UT', name: 'Utah' },
        { code: 'VT', name: 'Vermont' },
        { code: 'VA', name: 'Virginia' },
        { code: 'WA', name: 'Washington' },
        { code: 'WV', name: 'West Virginia' },
        { code: 'WI', name: 'Wisconsin' },
        { code: 'WY', name: 'Wyoming' },
    ];

    const handleAmountChange = (amount: number | 'custom') => {
        if (amount === 'custom') {
            setCustomAmount('');
            setDonationAmount(null);
            setIsCustomAmount(true);
        } else {
            setCustomAmount('');
            setDonationAmount(amount);
            setIsCustomAmount(false);
        }
    };

    const handleCustomAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        if (/^\d*\.?\d{0,2}$/.test(value)) {
            setCustomAmount(value);
            setDonationAmount(Number(value) || null);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!stripe || !elements) return;

        if (!donationAmount || donationAmount <= 0) {
            alert('Please enter a valid donation amount.');
            return;
        }

        const cardElement = elements.getElement(CardElement);

        if (!cardElement) {
            alert('Card element not found!');
            return;
        }

        try {
            const response = await fetch('https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/payments/create_payment_intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: donationAmount,
                    frequency,
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    address1,
                    address2,
                    city,
                    state,
                    zip,
                }),
            });

            const { clientSecret, error } = await response.json();

            if (error) {
                alert(`Error: ${error}`);
                return;
            }

            const { error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: `${firstName} ${lastName}`,
                        email,
                        address: {
                            line1: address1,
                            line2: address2,
                            city,
                            state,
                            postal_code: zip,
                            country: 'US',
                        },
                    },
                },
            });

            if (confirmError) {
                alert(`Payment failed: ${confirmError.message}`);
            } else {
                alert('Thank you for your donation!');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Something went wrong. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px', marginTop: '2rem', marginBottom: '2rem' }} className="checkout-form">

            <h3>Donation Frequency</h3>

            <select
                id="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as 'one-time' | 'recurring')}

                style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
            >
                <option value="one-time">One-Time</option>
                <option value="recurring">Recurring</option>
            </select>

            <h3>Donation Amount</h3>

            <div style={{ marginBottom: '10px' }}>
                {[25, 50, 100, 200].map((amount) => (
                    <button
                        key={amount}
                        type="button"
                        onClick={() => handleAmountChange(amount)}
                        style={{
                            padding: '10px',
                            margin: '5px',
                            border: donationAmount === amount ? '2px solid #28a745' : '1px solid #ccc',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            backgroundColor: '#f8f9fa',
                        }}
                    >
                        ${amount}
                    </button>
                ))}
                <button
                    type="button"
                    onClick={() => handleAmountChange('custom')}
                    style={{
                        padding: '10px',
                        margin: '5px',
                        border: isCustomAmount ? '2px solid #28a745' : '1px solid #ccc',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        backgroundColor: '#f8f9fa',
                    }}
                >
                    Custom
                </button>
            </div>
            {isCustomAmount && (
                <input
                    type="number"
                    placeholder="Enter custom amount"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    style={{ display: 'block', margin: '10px 0', padding: '8px', width: '95%' }}
                />
            )}

            <h3>Billing Information</h3>

            <div className="demographics">

                <label htmlFor="firstName">First Name</label>
                <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                // style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
                />

                <label htmlFor="lastName">Last Name</label>
                <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                // style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
                />

                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                // style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
                />

                <label htmlFor="address1">Address 1</label>
                <input
                    type="text"
                    id="address1"
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                    required
                // style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
                />

                <label htmlFor="address2">Address 2</label>
                <input
                    type="text"
                    id="address2"
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                // style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
                />

                <label htmlFor="city">City</label>
                <input
                    type="text"
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                // style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
                />
                <label htmlFor="state" className="select-state">State</label>
                <select
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                // style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
                >
                    <option value="">Select your state</option>
                    {states.map((state) => (
                        <option key={state.code} value={state.code}>
                            {state.name}
                        </option>
                    ))}
                </select>

                <label htmlFor="zip">Zip Code</label>
                <input
                    type="text"
                    id="zip"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    required
                // style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
                />
            </div>

            <h3>Payment Information</h3>

            <div style={{ marginBottom: '20px' }}>
                <CardElement options={{ style: { base: { color: '#333', fontSize: '16px' } } }} className="stripe-info" />
            </div>

            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                <input
                    type="checkbox"
                    id="nonRefundablePolicy"
                    checked={isPolicyChecked}
                    onChange={(e) => setIsPolicyChecked(e.target.checked)}
                />
                <label htmlFor="nonRefundablePolicy" style={{ marginLeft: '10px' }}>
                    I understand that this donation is <strong>non-refundable</strong> as per the organization's policy.
                </label>
            </div>

            <button type="submit" disabled={!stripe} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1.1rem' }}>
                Donate Now
            </button>
        </form>
    );
};

export default CheckoutForm;