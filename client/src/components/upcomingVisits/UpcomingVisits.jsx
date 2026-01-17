import { useState } from "react";
import { useVisits } from "../../context/VisitsContext";
import { useCurrency } from "../../context/CurrencyContext";
import { useNavigate } from "react-router-dom";
import "./upcomingVisits.scss";

function UpcomingVisits() {
  const { upcomingVisits, pastVisits, cancelVisit, rescheduleVisit, getVisitStats } = useVisits();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [showRescheduleModal, setShowRescheduleModal] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({ date: "", time: "" });

  const stats = getVisitStats();

  const handleCancelVisit = (visitId) => {
    if (window.confirm("Are you sure you want to cancel this visit? The booking fee will be refunded within 3-5 business days.")) {
      cancelVisit(visitId);
    }
  };

  const handleReschedule = (visitId) => {
    if (rescheduleData.date && rescheduleData.time) {
      rescheduleVisit(visitId, rescheduleData.date, rescheduleData.time);
      setShowRescheduleModal(null);
      setRescheduleData({ date: "", time: "" });
    }
  };

  const formatDateTime = (date, time) => {
    const visitDate = new Date(`${date}T${time}`);
    return {
      date: visitDate.toLocaleDateString("en-US", { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: visitDate.toLocaleTimeString("en-US", { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#4caf50';
      case 'cancelled': return '#f44336';
      case 'rescheduled': return '#ff9800';
      case 'completed': return '#2196f3';
      default: return '#666';
    }
  };

  const getVisitTypeLabel = (type) => {
    switch (type) {
      case 'in-person': return 'In-Person Visit';
      case 'virtual': return 'Virtual Tour';
      case 'premium': return 'Premium Visit + Report';
      default: return 'Property Visit';
    }
  };

  // Generate available time slots for rescheduling
  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
  ];

  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay();
      
      // Skip weekends for in-person visits
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    return dates;
  };

  const renderVisitCard = (visit, isPast = false) => {
    const { date: formattedDate, time: formattedTime } = formatDateTime(visit.date, visit.time);
    
    return (
      <div key={visit.id} className="visit-card">
        <div className="visit-header">
          <div className="visit-property">
            <h4>{visit.propertyTitle}</h4>
            <p className="property-address">📍 {visit.propertyAddress}</p>
          </div>
          <div className="visit-status" style={{ color: getStatusColor(visit.status) }}>
            {visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}
          </div>
        </div>

        <div className="visit-details">
          <div className="visit-info">
            <div className="info-item">
              <span className="label">📅 Date:</span>
              <span className="value">{formattedDate}</span>
            </div>
            <div className="info-item">
              <span className="label">🕐 Time:</span>
              <span className="value">{formattedTime}</span>
            </div>
            <div className="info-item">
              <span className="label">🏠 Type:</span>
              <span className="value">{getVisitTypeLabel(visit.type)}</span>
            </div>
            <div className="info-item">
              <span className="label">💰 Fee:</span>
              <span className="value">{formatPrice(visit.fee)}</span>
            </div>
          </div>

          <div className="agent-info">
            <h5>Agent Details</h5>
            <p><strong>👤 Name:</strong> {visit.agentName}</p>
            {visit.agentPhone && <p><strong>📞 Phone:</strong> {visit.agentPhone}</p>}
            {visit.agentEmail && <p><strong>✉️ Email:</strong> {visit.agentEmail}</p>}
          </div>
        </div>

        {visit.notes && (
          <div className="visit-notes">
            <strong>📝 Notes:</strong> {visit.notes}
          </div>
        )}

        <div className="visit-booking-info">
          <div className="booking-details">
            <span>Confirmation: <strong>{visit.confirmationNumber}</strong></span>
            <span>Payment ID: <strong>{visit.paymentId}</strong></span>
          </div>
          <div className="booking-date">
            Booked on: {new Date(visit.bookingDate).toLocaleDateString()}
          </div>
        </div>

        {!isPast && visit.status === 'confirmed' && (
          <div className="visit-actions">
            <button 
              className="btn-reschedule"
              onClick={() => setShowRescheduleModal(visit.id)}
            >
              📅 Reschedule
            </button>
            <button 
              className="btn-cancel"
              onClick={() => handleCancelVisit(visit.id)}
            >
              ❌ Cancel Visit
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="upcoming-visits">
      {/* Statistics Section */}
      <div className="visits-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.upcoming}</div>
          <div className="stat-label">Upcoming</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.cancelled}</div>
          <div className="stat-label">Cancelled</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Visits</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="visits-tabs">
        <button 
          className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming Visits ({upcomingVisits.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Past Visits ({pastVisits.length})
        </button>
      </div>

      {/* Visits List */}
      <div className="visits-content">
        {activeTab === 'upcoming' ? (
          upcomingVisits.length > 0 ? (
            <div className="visits-list">
              {upcomingVisits.map(visit => renderVisitCard(visit))}
            </div>
          ) : (
            <div className="no-visits">
              <h3>No Upcoming Visits</h3>
              <p>You don't have any scheduled property visits yet.</p>
              <p>Browse properties and book a visit to get started!</p>
              <button className="browse-btn" onClick={() => navigate("/list")}>
                Browse Properties
              </button>
            </div>
          )
        ) : (
          pastVisits.length > 0 ? (
            <div className="visits-list">
              {pastVisits.map(visit => renderVisitCard(visit, true))}
            </div>
          ) : (
            <div className="no-visits">
              <h3>No Past Visits</h3>
              <p>Your completed and cancelled visits will appear here.</p>
            </div>
          )
        )}
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="modal-overlay">
          <div className="reschedule-modal">
            <div className="modal-header">
              <h3>Reschedule Visit</h3>
              <button 
                className="close-btn"
                onClick={() => setShowRescheduleModal(null)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="form-group">
                <label>New Date:</label>
                <select 
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})}
                >
                  <option value="">Select a date</option>
                  {generateAvailableDates().map(date => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString("en-US", { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>New Time:</label>
                <select 
                  value={rescheduleData.time}
                  onChange={(e) => setRescheduleData({...rescheduleData, time: e.target.value})}
                >
                  <option value="">Select a time</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>
                      {new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-cancel"
                onClick={() => setShowRescheduleModal(null)}
              >
                Cancel
              </button>
              <button 
                className="btn-confirm"
                onClick={() => handleReschedule(showRescheduleModal)}
                disabled={!rescheduleData.date || !rescheduleData.time}
              >
                Reschedule Visit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UpcomingVisits;