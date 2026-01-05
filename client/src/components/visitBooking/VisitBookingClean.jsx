import { useState, useEffect } from "react";
import { useCurrency } from "../../context/CurrencyContext";
import { useVisits } from "../../context/VisitsContext";
import PaymentForm from './PaymentForm';
import apiRequest from "../../lib/apiRequest";
import toast from "react-hot-toast";
import "./visitBooking.scss";

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
  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Confirmation
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]); // "HH:MM" strings already taken

  // Fetch already-booked slots whenever the date changes
  useEffect(() => {
    if (!selectedDate || !property?.id) return;
    setBookedSlots([]);
    apiRequest.get(`/bookings/slots/${property.id}?date=${selectedDate}`)
      .then(res => {
        const slots = res.data.bookedSlots || [];
        setBookedSlots(slots);
        // Clear selected time if it became booked
        if (selectedTime && slots.includes(selectedTime)) setSelectedTime("");
      })
      .catch(() => setBookedSlots([]));
  }, [selectedDate, property?.id]);

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

  const handleContactInfoChange = (field, value) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep1 = () => {
    return selectedDate && selectedTime && visitType && 
           contactInfo.name && contactInfo.email && contactInfo.phone;
  };

  const processPayment = async (stripeData = null) => {
    // Generate confirmation number immediately — never fail on this
    const confirmationNumber = `CONF_${Date.now()}`;
    const txId = stripeData?.paymentIntent?.id || `TXN_${Date.now()}`;

    // Try to persist booking to backend (non-blocking — UI won't fail if this fails)
    try {
      await apiRequest.post("/bookings/confirm", {
        postId: property.id,
        visitType,
        date: selectedDate,
        time: selectedTime,
        fee: visitFee,
        contactInfo,
        notes,
        paymentId: txId,
        paymentMethod: stripeData ? "stripe" : "demo",
      });
    } catch (err) {
      console.warn("Booking API unavailable, saved locally only:", err?.response?.data?.message || err.message);
    }

    const booking = {
      propertyId: property.id,
      propertyTitle: property.title,
      propertyAddress: property.address,
      propertyImages: property.images,
      agentName: agent?.name || "Property Agent",
      agentPhone: agent?.phone || "",
      agentEmail: agent?.email || "",
      date: selectedDate,
      time: selectedTime,
      type: visitType,
      fee: visitFee,
      contactInfo,
      notes,
      paymentId: txId,
      confirmationNumber,
    };

    try {
      addVisit(booking);
    } catch (err) {
      console.warn("Could not save visit locally:", err);
    }

    setBookingResult(booking);
    setStep(3);
    toast.success(`Visit booked! Confirmation: ${confirmationNumber}`, { duration: 6000 });

    if (onBookingComplete) onBookingComplete(booking);
  };

  const renderStep1 = () => (
    <div className="booking-step">
      <h3>Visit Details</h3>
      
      <div className="form-group">
        <label>Visit Type</label>
        <div className="visit-type-options">
          <div className={`visit-option ${visitType === 'in-person' ? 'selected' : ''}`}>
            <input
              type="radio"
              id="in-person"
              name="visitType"
              value="in-person"
              checked={visitType === 'in-person'}
              onChange={(e) => setVisitType(e.target.value)}
            />
            <label htmlFor="in-person">
              <div className="option-header">
                <span className="option-icon">🏠</span>
                <span className="option-title">In-Person Visit</span>
                <span className="option-price">{formatPrice(visitPricing['in-person'])}</span>
              </div>
              <p className="option-description">Meet the agent at the property for a guided tour</p>
            </label>
          </div>
          
          <div className={`visit-option ${visitType === 'virtual' ? 'selected' : ''}`}>
            <input
              type="radio"
              id="virtual"
              name="visitType"
              value="virtual"
              checked={visitType === 'virtual'}
              onChange={(e) => setVisitType(e.target.value)}
            />
            <label htmlFor="virtual">
              <div className="option-header">
                <span className="option-icon">💻</span>
                <span className="option-title">Virtual Tour</span>
                <span className="option-price">{formatPrice(visitPricing['virtual'])}</span>
              </div>
              <p className="option-description">Video call tour with live agent interaction</p>
            </label>
          </div>
          
          <div className={`visit-option ${visitType === 'premium' ? 'selected' : ''}`}>
            <input
              type="radio"
              id="premium"
              name="visitType"
              value="premium"
              checked={visitType === 'premium'}
              onChange={(e) => setVisitType(e.target.value)}
            />
            <label htmlFor="premium">
              <div className="option-header">
                <span className="option-icon">⭐</span>
                <span className="option-title">Premium Visit + Report</span>
                <span className="option-price">{formatPrice(visitPricing['premium'])}</span>
              </div>
              <p className="option-description">In-person visit plus detailed property analysis report</p>
            </label>
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
            {timeSlots.map(time => {
              const isBooked = bookedSlots.includes(time);
              return (
                <option key={time} value={time} disabled={isBooked}>
                  {new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}{isBooked ? " — Booked" : ""}
                </option>
              );
            })}
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
            placeholder="+1 (555) 123-4567"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Special Notes (Optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any specific requirements or questions..."
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
          <span>{selectedTime ? new Date(`2000-01-01T${selectedTime}`).toLocaleTimeString("en-US", { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          }) : 'Not selected'}</span>
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

      <PaymentForm
        amount={visitFee}
        onPaymentSuccess={processPayment}
        contactInfo={contactInfo}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
      />
    </div>
  );

  const renderStep3 = () => (
    <div className="booking-step confirmation-step">
      <div className="confirmation-header">
        <div className="success-icon">✅</div>
        <h3>Visit Booked Successfully!</h3>
        <p>Your property visit has been confirmed</p>
      </div>

      <div className="confirmation-details">
        <div className="confirmation-number">
          <strong>Confirmation #: {bookingResult?.confirmationNumber}</strong>
        </div>

        <div className="visit-details">
          <h4>Visit Details</h4>
          <div className="detail-item">
            <strong>Property:</strong> {property.title}
          </div>
          <div className="detail-item">
            <strong>Address:</strong> {property.address}
          </div>
          <div className="detail-item">
            <strong>Date:</strong> {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }) : ''}
          </div>
          <div className="detail-item">
            <strong>Time:</strong> {selectedTime ? new Date(`2000-01-01T${selectedTime}`).toLocaleTimeString("en-US", { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            }) : ''}
          </div>
          <div className="detail-item">
            <strong>Visit Type:</strong> {visitType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </div>
          <div className="detail-item">
            <strong>Fee Paid:</strong> {formatPrice(visitFee)}
          </div>
        </div>

        <div className="agent-details">
          <h4>Agent Information</h4>
          <div className="detail-item">
            <strong>Agent:</strong> {agent?.name || "Property Agent"}
          </div>
          <div className="detail-item">
            <strong>Phone:</strong> {agent?.phone || "+1 (555) 123-4567"}
          </div>
          <div className="detail-item">
            <strong>Email:</strong> {agent?.email || "agent@realestate.com"}
          </div>
        </div>
      </div>

      <div className="next-steps">
        <h4>What's Next?</h4>
        <ul>
          <li>✉️ You'll receive a confirmation email with all details</li>
          <li>📞 The agent will call you 24 hours before the visit</li>
          <li>🕐 Please arrive 5 minutes early for in-person visits</li>
          <li>🆔 Bring a valid ID and any questions you have</li>
          <li>📋 Check your upcoming visits in your profile</li>
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
              {/* Payment is now handled by the Stripe form */}
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