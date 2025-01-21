import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

interface ProviderCheckoutFormProps {
  initialAmount: number;
  providerData?: any;
  onPaymentSuccess: () => void;
  onClose: () => void;
}

const ProviderCheckoutForm: React.FC<ProviderCheckoutFormProps> = ({
  initialAmount,
  providerData,
  onPaymentSuccess,
  onClose
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isPolicyChecked, setIsPolicyChecked] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    try {
      const { error: paymentMethodError } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          email: email,
        },
      });

      if (paymentMethodError) {
        console.error('Payment method error:', paymentMethodError);
        return;
      }

      // Add your payment processing logic here
      await onPaymentSuccess();
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
        <button onClick={onClose} className="mb-4 font-bold bg-gray-200 p-2 rounded-md border border-gray-300">Back</button>
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="your@email.com"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <CardElement className="p-3 border border-gray-300 rounded-md" />
      </div>

      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <input
          type="checkbox"
          id="subscriptionPolicy"
          checked={isPolicyChecked}
          onChange={(e) => setIsPolicyChecked(e.target.checked)}
        />
        <label htmlFor="subscriptionPolicy" style={{ marginLeft: '10px' }}>
          I understand this is a recurring monthly charge of ${initialAmount} and if cancelled, 
          the membership will remain active until the last day of the billing period.
        </label>
      </div>

      <button 
        type="submit" 
        disabled={!stripe || !isPolicyChecked || !email}
        className="w-full py-2 px-4 bg-[#4A6FA5] text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        Register
      </button>
    </form>
  );
};

export default ProviderCheckoutForm; 