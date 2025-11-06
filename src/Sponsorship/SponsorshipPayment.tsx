import React, { useState } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import { createPaymentIntent, confirmSponsorship, SponsorshipTier } from '../Utility/ApiCall';
import { CreditCard, Lock, CheckCircle } from 'lucide-react';

const stripePromise = loadStripe('pk_live_51QLVtXJCAzcIvuNOwz9neiT1W3VFBfhOO1XwhxF44UsatLhu6ksdsuMqDjIbpnvzV89gidl2qWVbZRTEKxmBZDJE009Ya5sRCx');

interface SponsorshipPaymentProps {
  providerId: number;
  tier: SponsorshipTier;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<{
  providerId: number;
  tier: SponsorshipTier;
  onSuccess: () => void;
  onCancel: () => void;
}> = ({ providerId, tier, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Create payment intent
      const paymentIntentResponse = await createPaymentIntent(providerId, tier.id);
      const { client_secret, payment_intent_id } = paymentIntentResponse;

      // Get card element
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        client_secret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        toast.error(stripeError.message || 'Payment failed');
        setProcessing(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        // Confirm sponsorship with backend
        await confirmSponsorship(payment_intent_id, providerId, tier.id);
        
        toast.success(`Successfully subscribed to ${tier.name}!`);
        onSuccess();
      } else {
        setError('Payment was not successful');
        toast.error('Payment was not successful');
        setProcessing(false);
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      const errorMessage = err.message || 'An error occurred during payment';
      setError(errorMessage);
      toast.error(errorMessage);
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-700 font-medium">Selected Tier:</span>
          <span className="text-lg font-bold text-blue-600">{tier.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700 font-medium">Monthly Cost:</span>
          <span className="text-2xl font-bold text-gray-900">${tier.price}/month</span>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <CreditCard className="w-4 h-4 inline mr-2" />
          Card Information
        </label>
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <CardElement options={cardElementOptions} />
        </div>
        {error && (
          <div className="text-red-600 text-sm mt-2">{error}</div>
        )}
      </div>

      <div className="flex items-start space-x-2 text-sm text-gray-600">
        <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>Your payment information is secure and encrypted. We use Stripe to process payments securely.</span>
      </div>

      <div className="flex space-x-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Subscribe ${tier.price}/month</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

const SponsorshipPayment: React.FC<SponsorshipPaymentProps> = ({
  providerId,
  tier,
  onSuccess,
  onCancel,
}) => {
  const options: StripeElementsOptions = {
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#2563eb',
      },
    },
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Sponsorship</h2>
        <p className="text-gray-600">Enter your payment information to subscribe to {tier.name}</p>
      </div>

      <Elements stripe={stripePromise} options={options}>
        <PaymentForm
          providerId={providerId}
          tier={tier}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </Elements>
    </div>
  );
};

export default SponsorshipPayment;
