import { useState, useEffect } from "react";
import "./contact.scss";

function Contact() {
  const [selectedOffice, setSelectedOffice] = useState("headquarters");
  const [currentTimes, setCurrentTimes] = useState({});

  // Office locations with different time zones
  const offices = [
    {
      id: "headquarters",
      name: "Headquarters - New York",
      address: "1250 Broadway, Suite 3201, New York, NY 10001",
      timezone: "America/New_York",
      phone: "+1 (212) 555-0123",
      fax: "+1 (212) 555-0124",
      email: "newyork@estateease.com",
      hours: {
        weekdays: "9:00 AM - 7:00 PM EST",
        saturday: "10:00 AM - 4:00 PM EST",
        sunday: "Closed"
      },
      languages: ["English", "Spanish", "French"],
      specialties: ["Luxury Properties", "Commercial Real Estate", "Investment Properties"],
      manager: "Alexandra Thompson",
      employees: 45
    },
    {
      id: "west-coast",
      name: "West Coast Office - Los Angeles",
      address: "9800 Wilshire Blvd, Suite 400, Beverly Hills, CA 90212",
      timezone: "America/Los_Angeles",
      phone: "+1 (310) 555-0156",
      fax: "+1 (310) 555-0157",
      email: "losangeles@estateease.com",
      hours: {
        weekdays: "8:00 AM - 6:00 PM PST",
        saturday: "9:00 AM - 3:00 PM PST",
        sunday: "Closed"
      },
      languages: ["English", "Spanish", "Mandarin"],
      specialties: ["Luxury Homes", "Celebrity Properties", "Tech Industry Housing"],
      manager: "Michael Chen",
      employees: 32
    },
    {
      id: "midwest",
      name: "Midwest Office - Chicago",
      address: "875 North Michigan Ave, Suite 1200, Chicago, IL 60611",
      timezone: "America/Chicago",
      phone: "+1 (312) 555-0189",
      fax: "+1 (312) 555-0190",
      email: "chicago@estateease.com",
      hours: {
        weekdays: "8:30 AM - 6:30 PM CST",
        saturday: "9:30 AM - 3:30 PM CST",
        sunday: "Closed"
      },
      languages: ["English", "Polish", "German"],
      specialties: ["Urban Properties", "Investment Real Estate", "First-Time Buyers"],
      manager: "Sarah Johnson",
      employees: 28
    },
    {
      id: "southeast",
      name: "Southeast Office - Miami",
      address: "1450 Brickell Ave, Suite 1900, Miami, FL 33131",
      timezone: "America/New_York",
      phone: "+1 (305) 555-0234",
      fax: "+1 (305) 555-0235",
      email: "miami@estateease.com",
      hours: {
        weekdays: "9:00 AM - 7:00 PM EST",
        saturday: "10:00 AM - 5:00 PM EST",
        sunday: "12:00 PM - 4:00 PM EST"
      },
      languages: ["English", "Spanish", "Portuguese"],
      specialties: ["Waterfront Properties", "International Clients", "Vacation Homes"],
      manager: "Carlos Rodriguez",
      employees: 23
    },
    {
      id: "international",
      name: "International Office - London",
      address: "25 Canada Square, Canary Wharf, London E14 5LQ, UK",
      timezone: "Europe/London",
      phone: "+44 20 7555 0156",
      fax: "+44 20 7555 0157",
      email: "london@estateease.com",
      hours: {
        weekdays: "9:00 AM - 6:00 PM GMT",
        saturday: "10:00 AM - 2:00 PM GMT",
        sunday: "Closed"
      },
      languages: ["English", "French", "German", "Italian"],
      specialties: ["International Investments", "Relocation Services", "Prime London Properties"],
      manager: "James Wilson",
      employees: 18
    }
  ];

  const departments = [
    {
      name: "Sales & Leasing",
      email: "sales@estateease.com",
      phone: "+1 (800) 555-SALE",
      description: "New property inquiries, leasing, and sales assistance"
    },
    {
      name: "Property Management",
      email: "management@estateease.com",
      phone: "+1 (800) 555-MGMT",
      description: "Existing property management and maintenance requests"
    },
    {
      name: "Investment Services",
      email: "investments@estateease.com",
      phone: "+1 (800) 555-INVEST",
      description: "Investment opportunities and portfolio management"
    },
    {
      name: "Corporate Relations",
      email: "corporate@estateease.com",
      phone: "+1 (800) 555-CORP",
      description: "Business partnerships and corporate accounts"
    },
    {
      name: "Customer Support",
      email: "support@estateease.com",
      phone: "+1 (800) 555-HELP",
      description: "General inquiries and technical support"
    }
  ];

  // Update current times for each office
  useEffect(() => {
    const updateTimes = () => {
      const times = {};
      offices.forEach(office => {
        const now = new Date();
        times[office.id] = now.toLocaleString("en-US", {
          timeZone: office.timezone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        });
      });
      setCurrentTimes(times);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  const selectedOfficeData = offices.find(office => office.id === selectedOffice);

  // Handle department actions
  const handleCallDepartment = (dept) => {
    window.open(`tel:${dept.phone.replace(/[^\d]/g, '')}`, '_self');
  };

  const handleEmailDepartment = (dept) => {
    const subject = encodeURIComponent(`Inquiry - ${dept.name}`);
    const body = encodeURIComponent(`Hello ${dept.name} Team,

I would like to inquire about your services.

${dept.description}

Please contact me at your earliest convenience.

Best regards`);
    
    window.open(`mailto:${dept.email}?subject=${subject}&body=${body}`, '_blank');
  };

  // Handle contact form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const selectedOffice = offices.find(office => office.id === formData.get('office'));
    const selectedDept = departments.find(dept => dept.name === formData.get('department'));
    
    const subject = encodeURIComponent(`${formData.get('subject')} - ${selectedOffice?.name || 'General Inquiry'}`);
    const body = encodeURIComponent(`Name: ${formData.get('firstName')} ${formData.get('lastName')}
Email: ${formData.get('email')}
Phone: ${formData.get('phone')}
Preferred Office: ${selectedOffice?.name || 'Not specified'}
Department: ${selectedDept?.name || 'Not specified'}

Message:
${formData.get('message')}`);

    const email = selectedDept?.email || selectedOffice?.email || 'contact@estateease.com';
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
  };

  const getOfficeStatus = (office) => {
    const now = new Date();
    const currentHour = parseInt(now.toLocaleString("en-US", {
      timeZone: office.timezone,
      hour: '2-digit',
      hour12: false
    }));
    const dayOfWeek = now.toLocaleDateString("en-US", {
      timeZone: office.timezone,
      weekday: 'long'
    });

    if (dayOfWeek === 'Sunday' && office.hours.sunday === 'Closed') {
      return { status: 'closed', message: 'Closed Today' };
    }
    
    if (dayOfWeek === 'Saturday') {
      if (office.hours.saturday === 'Closed') {
        return { status: 'closed', message: 'Closed Today' };
      }
      // Simplified check for Saturday hours
      if (currentHour >= 9 && currentHour < 17) {
        return { status: 'open', message: 'Open Now' };
      }
    }
    
    if (['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(dayOfWeek)) {
      if (currentHour >= 8 && currentHour < 19) {
        return { status: 'open', message: 'Open Now' };
      }
    }
    
    return { status: 'closed', message: 'Closed Now' };
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="hero-content">
          <h1>Get in Touch</h1>
          <p>
            We're here to help you with all your real estate needs. Reach out to any of our 
            offices worldwide or contact our specialized departments directly.
          </p>
        </div>
      </section>

      {/* Office Selector */}
      <section className="office-selector">
        <div className="selector-container">
          <h2>Choose Your Preferred Office</h2>
          <div className="office-tabs">
            {offices.map(office => (
              <button
                key={office.id}
                className={`office-tab ${selectedOffice === office.id ? 'active' : ''}`}
                onClick={() => setSelectedOffice(office.id)}
              >
                <div className="tab-location">{office.name.split(' - ')[1]}</div>
                <div className="tab-status">
                  <span className={`status-indicator ${getOfficeStatus(office).status}`}></span>
                  {getOfficeStatus(office).message}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Selected Office Details */}
      <section className="office-details">
        <div className="details-container">
          <div className="office-main-info">
            <div className="office-header">
              <h2>{selectedOfficeData.name}</h2>
              <div className="office-status">
                <span className={`status-dot ${getOfficeStatus(selectedOfficeData).status}`}></span>
                {getOfficeStatus(selectedOfficeData).message}
              </div>
            </div>
            
            <div className="office-content">
              <div className="office-contact">
                <div className="contact-section">
                  <h3>📍 Address</h3>
                  <p>{selectedOfficeData.address}</p>
                </div>

                <div className="contact-section">
                  <h3>📞 Phone & Fax</h3>
                  <p><strong>Phone:</strong> {selectedOfficeData.phone}</p>
                  <p><strong>Fax:</strong> {selectedOfficeData.fax}</p>
                </div>

                <div className="contact-section">
                  <h3>✉️ Email</h3>
                  <p>{selectedOfficeData.email}</p>
                </div>

                <div className="contact-section">
                  <h3>🕒 Business Hours</h3>
                  <div className="hours-grid">
                    <div className="hours-item">
                      <span>Weekdays:</span>
                      <span>{selectedOfficeData.hours.weekdays}</span>
                    </div>
                    <div className="hours-item">
                      <span>Saturday:</span>
                      <span>{selectedOfficeData.hours.saturday}</span>
                    </div>
                    <div className="hours-item">
                      <span>Sunday:</span>
                      <span>{selectedOfficeData.hours.sunday}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="office-meta">
                <div className="meta-section">
                  <h3>🌍 Languages Spoken</h3>
                  <div className="language-tags">
                    {selectedOfficeData.languages.map(lang => (
                      <span key={lang} className="language-tag">{lang}</span>
                    ))}
                  </div>
                </div>

                <div className="meta-section">
                  <h3>🏢 Specialties</h3>
                  <div className="specialty-tags">
                    {selectedOfficeData.specialties.map(specialty => (
                      <span key={specialty} className="specialty-tag">{specialty}</span>
                    ))}
                  </div>
                </div>

                <div className="meta-section">
                  <h3>👥 Office Manager</h3>
                  <p>{selectedOfficeData.manager}</p>
                </div>

                <div className="meta-section">
                  <h3>📊 Team Size</h3>
                  <p>{selectedOfficeData.employees} Real Estate Professionals</p>
                </div>
              </div>
            </div>
          </div>

          <div className="office-time">
            <h3>🕐 Current Local Time</h3>
            <div className="time-display">
              {currentTimes[selectedOffice] || "Loading..."}
            </div>
            <p className="timezone-info">
              Timezone: {selectedOfficeData.timezone.replace('_', ' ')}
            </p>
          </div>
        </div>
      </section>

      {/* World Clock */}
      <section className="world-clock">
        <div className="clock-container">
          <h2>All Office Times</h2>
          <div className="time-zones">
            {offices.map(office => (
              <div key={office.id} className="timezone-card">
                <div className="timezone-location">
                  {office.name.split(' - ')[1]}
                </div>
                <div className="timezone-time">
                  {currentTimes[office.id]?.split(',')[1]?.trim() || "Loading..."}
                </div>
                <div className="timezone-date">
                  {currentTimes[office.id]?.split(',')[0] || ""}
                </div>
                <div className={`timezone-status ${getOfficeStatus(office).status}`}>
                  {getOfficeStatus(office).message}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Department Directory */}
      <section className="department-directory">
        <div className="directory-container">
          <h2>Department Directory</h2>
          <div className="departments-grid">
            {departments.map(dept => (
              <div key={dept.name} className="department-card">
                <h3>{dept.name}</h3>
                <div className="dept-contact">
                  <p><strong>📞</strong> {dept.phone}</p>
                  <p><strong>✉️</strong> {dept.email}</p>
                </div>
                <p className="dept-description">{dept.description}</p>
                <div className="dept-actions">
                  <button 
                    className="btn-primary"
                    onClick={() => handleCallDepartment(dept)}
                    title={`Call ${dept.name}`}
                  >
                    📞 Call Now
                  </button>
                  <button 
                    className="btn-secondary"
                    onClick={() => handleEmailDepartment(dept)}
                    title={`Email ${dept.name}`}
                  >
                    📧 Send Email
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="emergency-contact">
        <div className="emergency-container">
          <div className="emergency-content">
            <h2>🚨 Emergency Property Services</h2>
            <p>For urgent property maintenance or emergency situations:</p>
            <div className="emergency-info">
              <div className="emergency-item">
                <strong>24/7 Emergency Line:</strong>
                <span>+1 (800) 555-URGENT</span>
              </div>
              <div className="emergency-item">
                <strong>Emergency Email:</strong>
                <span>emergency@estateease.com</span>
              </div>
            </div>
            <p className="emergency-note">
              * Emergency services available for existing clients only. 
              Response time: Within 2 hours for critical issues.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="contact-form-section">
        <div className="form-container">
          <h2>Send Us a Message</h2>
          <form className="contact-form" onSubmit={handleFormSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <input type="text" name="firstName" required />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input type="text" name="lastName" required />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input type="email" name="email" required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" name="phone" />
              </div>
            </div>
            
            <div className="form-group">
              <label>Preferred Office</label>
              <select name="office">
                {offices.map(office => (
                  <option key={office.id} value={office.id}>
                    {office.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Department</label>
              <select name="department">
                {departments.map(dept => (
                  <option key={dept.name} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Subject *</label>
              <input type="text" name="subject" required />
            </div>
            
            <div className="form-group">
              <label>Message *</label>
              <textarea rows="5" name="message" required></textarea>
            </div>
            
            <button type="submit" className="btn-primary submit-btn">
              Send Message
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Contact;
