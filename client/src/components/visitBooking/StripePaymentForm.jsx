import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#424770',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
      iconColor: '#9e2146',
    },
  },
};

function StripePaymentForm({ amount, onPaymentSuccess, onPaymentError, contactInfo, isProcessing, setIsProcessing }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);
    setError(null);

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please try again.');
      setIsProcessing(false);
      return;
    }

    const card = elements.getElement(CardElement);

    if (!card) {
      setError('Card element not found.');
      setIsProcessing(false);
      return;
    }

    try {
      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card,
        billing_details: {
          name: contactInfo.name,
          email: contactInfo.email,
          phone: contactInfo.phone,
        },
      });

      if (paymentMethodError) {
        setError(paymentMethodError.message);
        setIsProcessing(false);
        return;
      }

      // In a real app, you would send the payment method to your server
      // to create a payment intent and confirm the payment
      
      // For demo purposes, simulate successful payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockPaymentIntent = {
        id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'succeeded',
        amount: amount * 100, // Stripe amounts are in cents
        currency: 'usd',
      };

      onPaymentSuccess({
        paymentIntent: mockPaymentIntent,
        paymentMethod,
      });

    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
      onPaymentError(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-payment-form">
      <h4>💳 Payment Information</h4>
      
      <div className="card-element-container">
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>

      {error && (
        <div className="payment-error">
          ❌ {error}
        </div>
      )}

      <div className="payment-summary">
        <div className="summary-row">
          <span>Visit Fee:</span>
          <span>${amount}</span>
        </div>
        <div className="summary-row total">
          <strong>
            <span>Total:</span>
            <span>${amount}</span>
          </strong>
        </div>
      </div>

      <div className="payment-security">
        <p>🔒 Your payment information is encrypted and secure</p>
        <p>💼 Powered by Stripe - Industry-leading payment security</p>
      </div>

      <button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="btn-pay"
      >
        {isProcessing ? 'Processing Payment...' : `Pay $${amount}`}
      </button>
    </form>
  );
}

export default StripePaymentForm;