import { useState, useEffect } from "react";
import { useCurrency } from "../../context/CurrencyContext";
import { useVisits } from "../../context/VisitsContext";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import "./visitBooking.scss";

// Initialize Stripe (replace with your actual publishable key)
const stripePromise = loadStripe('pk_test_51234567890abcdef...');

import StripePaymentForm from './StripePaymentForm';

// Main component wrapped with Stripe Elements provider
function VisitBookingWithStripe({ property, agent, onClose, onBookingComplete }) {
  return (
    <Elements stripe={stripePromise}>
      <VisitBooking 
        property={property} 
        agent={agent} 
        onClose={onClose} 
        onBookingComplete={onBookingComplete} 
      />
    </Elements>
  );
}

function VisitBooking({ property, agent, onClose, onBookingComplete }) {
  const { formatPrice } = useCurrency();
  const { addVisit } = useVisits();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [visitType, setVisitType] = useState("in-person");
  const [notes, setNotes] = useState("");
  const [contactInfo, setContactInfo] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    nameOnCard: ""
  });
  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Confirmation
  const [isProcessing, setIsProcessing] = useState(false);

  // Visit pricing based on type
  const visitPricing = {
    "in-person": 50,
    "virtual": 25,
    "premium": 100 // Includes detailed property report
  };

  const visitFee = visitPricing[visitType];

  // Generate available time slots
  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
  ];

  // Generate available dates (next 30 days, excluding weekends for in-person visits)
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends only for in-person visits
      if (visitType === "in-person" && (date.getDay() === 0 || date.getDay() === 6)) {
        continue;
      }
      
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  const availableDates = generateAvailableDates();

  const handleContactInfoChange = (field, value) => {
    setContactInfo(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentInfoChange = (field, value) => {
    setPaymentInfo(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    return selectedDate && selectedTime && contactInfo.name && 
           contactInfo.email && contactInfo.phone;
  };

  const validateStep2 = () => {
    return paymentInfo.cardNumber.length === 16 && 
           paymentInfo.expiryMonth && paymentInfo.expiryYear && 
           paymentInfo.cvv.length === 3 && paymentInfo.nameOnCard;
  };

  const formatCardNumber = (value) => {
    return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16 && /^\d*$/.test(value)) {
      handlePaymentInfoChange('cardNumber', value);
    }
  };

  const processPayment = async (stripeData = null) => {
    setIsProcessing(true);
    
    try {
      let paymentResult;
      
      if (stripeData) {
        // Real Stripe payment processing
        paymentResult = {
          success: true,
          transactionId: stripeData.paymentIntent.id,
          amount: visitFee,
          currency: "USD",
          paymentMethod: "stripe"
        };
      } else {
        // Simulate payment for demo (fallback)
        await new Promise(resolve => setTimeout(resolve, 2000));
        paymentResult = {
          success: true,
          transactionId: `TXN_${Date.now()}`,
          amount: visitFee,
          currency: "USD",
          paymentMethod: "demo"
        };
      }
      
      if (paymentResult.success) {
        setStep(3);
        
        // Create booking record
        const booking = {
          propertyId: property.id,
          propertyTitle: property.title,
          propertyAddress: property.address,
          propertyImages: property.images,
          agentId: agent?.id || "default",
          agentName: agent?.name || "Property Agent",
          agentPhone: agent?.phone || "",
          agentEmail: agent?.email || "",
          date: selectedDate,
          time: selectedTime,
          type: visitType,
          fee: visitFee,
          contactInfo,
          notes,
          paymentId: paymentResult.transactionId,
          confirmationNumber: `CONF_${Date.now()}`
        };
        
        // Add visit using visits context
        const savedVisit = addVisit(booking);
        
        if (onBookingComplete) {
          onBookingComplete(savedVisit);
        }
      }
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStep1 = () => (
    <div className="booking-step">
      <h3>Visit Details</h3>
      
      <div className="form-group">
        <label>Visit Type</label>
        <div className="visit-type-options">
          <div 
            className={`visit-option ${visitType === 'in-person' ? 'selected' : ''}`}
            onClick={() => setVisitType('in-person')}
          >
            <div className="option-header">
              <span className="option-icon">🏠</span>
              <span className="option-title">In-Person Visit</span>
              <span className="option-price">{formatPrice(visitPricing['in-person'])}</span>
            </div>
            <p className="option-description">Physical tour of the property with the agent</p>
          </div>
          
          <div 
            className={`visit-option ${visitType === 'virtual' ? 'selected' : ''}`}
            onClick={() => setVisitType('virtual')}
          >
            <div className="option-header">
              <span className="option-icon">💻</span>
              <span className="option-title">Virtual Tour</span>
              <span className="option-price">{formatPrice(visitPricing['virtual'])}</span>
            </div>
            <p className="option-description">Live video tour via video call</p>
          </div>
          
          <div 
            className={`visit-option ${visitType === 'premium' ? 'selected' : ''}`}
            onClick={() => setVisitType('premium')}
          >
            <div className="option-header">
              <span className="option-icon">⭐</span>
              <span className="option-title">Premium Visit</span>
              <span className="option-price">{formatPrice(visitPricing['premium'])}</span>
            </div>
            <p className="option-description">In-person visit + detailed property report</p>
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Preferred Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // Tomorrow
            max={new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]} // 30 days from now
            required
            className="date-picker"
          />
          {selectedDate && (
            <div className="selected-date-info">
              📅 {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Preferred Time</label>
          <select 
            value={selectedTime} 
            onChange={(e) => setSelectedTime(e.target.value)}
            required
          >
            <option value="">Select a time</option>
            {timeSlots.map(time => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Your Name</label>
        <input
          type="text"
          value={contactInfo.name}
          onChange={(e) => handleContactInfoChange('name', e.target.value)}
          placeholder="Enter your full name"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={contactInfo.email}
            onChange={(e) => handleContactInfoChange('email', e.target.value)}
            placeholder="your.email@example.com"
            required
          />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            type="tel"
            value={contactInfo.phone}
            onChange={(e) => handleContactInfoChange('phone', e.target.value)}
            placeholder="(555) 123-4567"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Additional Notes (Optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any specific questions or requirements..."
          rows="3"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="booking-step">
      <h3>Payment Information</h3>
      
      <div className="booking-summary">
        <h4>📋 Booking Summary</h4>
        <div className="summary-item">
          <span>Property:</span>
          <span>{property.title}</span>
        </div>
        <div className="summary-item">
          <span>Visit Type:</span>
          <span>{visitType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
        </div>
        <div className="summary-item">
          <span>Date:</span>
          <span>{selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }) : 'Not selected'}</span>
        </div>
        <div className="summary-item">
          <span>Time:</span>
          <span>{selectedTime || 'Not selected'}</span>
        </div>
        <div className="summary-item">
          <span>Contact:</span>
          <span>{contactInfo.name} ({contactInfo.email})</span>
        </div>
        <div className="summary-item total">
          <span>Total Fee:</span>
          <span>{formatPrice(visitFee)}</span>
        </div>
      </div>

      <StripePaymentForm
        amount={visitFee}
        onPaymentSuccess={processPayment}
        onPaymentError={(error) => {
          console.error('Payment error:', error);
          alert('Payment failed. Please try again.');
        }}
        contactInfo={contactInfo}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
      />
    </div>
  );
        <input
          type="text"
          value={formatCardNumber(paymentInfo.cardNumber)}
          onChange={handleCardNumberChange}
          placeholder="1234 5678 9012 3456"
          maxLength="19"
          required
        />
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
        </div>

        <div className="form-group">
          <label>CVV</label>
          <input
            type="text"
            value={paymentInfo.cvv}
            onChange={(e) => {
              if (e.target.value.length <= 3 && /^\d*$/.test(e.target.value)) {
                handlePaymentInfoChange('cvv', e.target.value);
              }
            }}
            placeholder="123"
            maxLength="3"
            required
          />
        </div>
      </div>

      <div className="security-notice">
        <span className="security-icon">🔒</span>
        <p>Your payment information is encrypted and secure. We never store your card details.</p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="booking-step confirmation">
      <div className="success-icon">✅</div>
      <h3>Booking Confirmed!</h3>
      
      <div className="confirmation-details">
        <h4>Visit Details</h4>
        <div className="detail-item">
          <strong>Property:</strong> {property.title}
        </div>
        <div className="detail-item">
          <strong>Date:</strong> {new Date(selectedDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
        <div className="detail-item">
          <strong>Time:</strong> {selectedTime}
        </div>
        <div className="detail-item">
          <strong>Type:</strong> {visitType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </div>
        <div className="detail-item">
          <strong>Agent:</strong> {agent?.name || "Property Agent"}
        </div>
        <div className="detail-item">
          <strong>Fee Paid:</strong> {formatPrice(visitFee)}
        </div>
      </div>

      <div className="next-steps">
        <h4>What's Next?</h4>
        <ul>
          <li>You'll receive a confirmation email with all details</li>
          <li>The agent will call you 24 hours before the visit</li>
          <li>Please arrive 5 minutes early for in-person visits</li>
          <li>Bring a valid ID and any questions you have</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="visit-booking-overlay">
      <div className="visit-booking-modal">
        <div className="modal-header">
          <h2>Schedule Property Visit</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="property-info">
          <img src={property.images?.[0] || '/noimage.jpg'} alt={property.title} />
          <div className="property-details">
            <h3>{property.title}</h3>
            <p>{property.address}</p>
            <div className="property-price">{formatPrice(property.price)}</div>
          </div>
        </div>

        <div className="booking-progress">
          <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Details</span>
          </div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Payment</span>
          </div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Confirmation</span>
          </div>
        </div>

        <div className="modal-content">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        <div className="modal-footer">
          {step === 1 && (
            <button 
              className="btn-primary" 
              onClick={() => setStep(2)}
              disabled={!validateStep1()}
            >
              Continue to Payment ({formatPrice(visitFee)})
            </button>
          )}
          
          {step === 2 && (
            <div className="footer-buttons">
              <button className="btn-secondary" onClick={() => setStep(1)}>
                Back to Details
              </button>
              <button 
                className="btn-primary" 
                onClick={processPayment}
                disabled={!validateStep2() || isProcessing}
              >
                {isProcessing ? 'Processing...' : `Pay ${formatPrice(visitFee)}`}
              </button>
            </div>
          )}
          
          {step === 3 && (
            <button className="btn-primary" onClick={onClose}>
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default VisitBooking;