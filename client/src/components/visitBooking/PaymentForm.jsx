import { useState } from 'react';

function PaymentForm({ amount, onPaymentSuccess, contactInfo, isProcessing, setIsProcessing }) {
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    nameOnCard: ""
  });
  const [errors, setErrors] = useState({});

  const handlePaymentInfoChange = (field, value) => {
    setPaymentInfo(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const formatCardNumber = (value) => {
    // Remove all non-digit characters
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16 && /^\d*$/.test(value)) {
      handlePaymentInfoChange('cardNumber', value);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!paymentInfo.nameOnCard.trim()) {
      newErrors.nameOnCard = "Name on card is required";
    }
    
    if (!paymentInfo.cardNumber || paymentInfo.cardNumber.length < 15) {
      newErrors.cardNumber = "Please enter a valid card number";
    }
    
    if (!paymentInfo.expiryMonth) {
      newErrors.expiryMonth = "Month is required";
    }
    
    if (!paymentInfo.expiryYear) {
      newErrors.expiryYear = "Year is required";
    }
    
    if (!paymentInfo.cvv || paymentInfo.cvv.length < 3) {
      newErrors.cvv = "Please enter a valid CVV";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful payment result
      const paymentResult = {
        paymentIntent: {
          id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          status: 'succeeded',
          amount: amount * 100,
          currency: 'usd',
        },
        paymentMethod: {
          id: `pm_${Date.now()}`,
          type: 'card',
          card: {
            brand: 'visa',
            last4: paymentInfo.cardNumber.slice(-4)
          }
        }
      };

      onPaymentSuccess(paymentResult);

    } catch (error) {
      setErrors({ general: 'Payment failed. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <h4>💳 Payment Information</h4>
      
      {errors.general && (
        <div className="payment-error">
          ❌ {errors.general}
        </div>
      )}

      <div className="form-group">
        <label>Name on Card</label>
        <input
          type="text"
          value={paymentInfo.nameOnCard}
          onChange={(e) => handlePaymentInfoChange('nameOnCard', e.target.value)}
          placeholder="John Doe"
          required
        />
        {errors.nameOnCard && <span className="error-text">{errors.nameOnCard}</span>}
      </div>

      <div className="form-group">
        <label>Card Number</label>
        <input
          type="text"
          value={formatCardNumber(paymentInfo.cardNumber)}
          onChange={handleCardNumberChange}
          placeholder="1234 5678 9012 3456"
          maxLength="19"
          required
        />
        {errors.cardNumber && <span className="error-text">{errors.cardNumber}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Expiry Month</label>
          <select
            value={paymentInfo.expiryMonth}
            onChange={(e) => handlePaymentInfoChange('expiryMonth', e.target.value)}
            required
          >
            <option value="">MM</option>
            {Array.from({length: 12}, (_, i) => (
              <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                {String(i + 1).padStart(2, '0')}
              </option>
            ))}
          </select>
          {errors.expiryMonth && <span className="error-text">{errors.expiryMonth}</span>}
        </div>

        <div className="form-group">
          <label>Expiry Year</label>
          <select
            value={paymentInfo.expiryYear}
            onChange={(e) => handlePaymentInfoChange('expiryYear', e.target.value)}
            required
          >
            <option value="">YYYY</option>
            {Array.from({length: 10}, (_, i) => (
              <option key={i} value={new Date().getFullYear() + i}>
                {new Date().getFullYear() + i}
              </option>
            ))}
          </select>
          {errors.expiryYear && <span className="error-text">{errors.expiryYear}</span>}
        </div>

        <div className="form-group">
          <label>CVV</label>
          <input
            type="text"
            value={paymentInfo.cvv}
            onChange={(e) => handlePaymentInfoChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="123"
            maxLength="4"
            required
          />
          {errors.cvv && <span className="error-text">{errors.cvv}</span>}
        </div>
      </div>

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

      <div className="security-info">
        <p>🔒 Your payment information is encrypted and secure</p>
        <p>💼 This is a demo payment form for testing purposes</p>
      </div>

      <button 
        type="submit" 
        disabled={isProcessing}
        className="btn-pay"
      >
        {isProcessing ? 'Processing Payment...' : `Pay $${amount}`}
      </button>
    </form>
  );
}

export default PaymentForm;