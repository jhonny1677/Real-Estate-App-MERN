import { useState } from "react";
import "./agents.scss";

function Agents() {
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");

  // Mock agent data
  const agents = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b830?w=400&h=400&fit=crop&crop=face",
      title: "Senior Real Estate Agent",
      specialty: "luxury",
      experience: 8,
      rating: 4.9,
      reviews: 127,
      phone: "+1 (555) 123-4567",
      email: "sarah.johnson@estateease.com",
      languages: ["English", "Spanish", "French"],
      certifications: ["CRS", "GRI", "ABR"],
      bio: "Sarah specializes in luxury properties and has helped over 500 families find their dream homes. With 8 years of experience in the Bay Area market, she's known for her attention to detail and exceptional client service.",
      sales: 89,
      area: "Downtown & Financial District",
      achievements: ["Top Agent 2023", "Client Choice Award", "Million Dollar Club"]
    },
    {
      id: 2,
      name: "Michael Chen",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      title: "Commercial Real Estate Specialist",
      specialty: "commercial",
      experience: 12,
      rating: 4.8,
      reviews: 203,
      phone: "+1 (555) 234-5678",
      email: "michael.chen@estateease.com",
      languages: ["English", "Mandarin", "Cantonese"],
      certifications: ["CCIM", "SIOR", "CRE"],
      bio: "Michael is our go-to expert for commercial properties. He has facilitated over $200M in commercial transactions and specializes in office buildings, retail spaces, and industrial properties.",
      sales: 156,
      area: "Business District & Industrial Zone",
      achievements: ["Commercial Agent of the Year", "President's Circle", "Top Producer"]
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
      title: "First-Time Buyer Specialist",
      specialty: "residential",
      experience: 5,
      rating: 4.9,
      reviews: 89,
      phone: "+1 (555) 345-6789",
      email: "emily.rodriguez@estateease.com",
      languages: ["English", "Spanish"],
      certifications: ["ABR", "GRI", "SFR"],
      bio: "Emily loves helping first-time buyers navigate the real estate market. She's patient, thorough, and dedicated to making the home buying process as smooth as possible for her clients.",
      sales: 67,
      area: "Suburban Areas & Family Neighborhoods",
      achievements: ["Rising Star Award", "Client Satisfaction Leader", "Rookie of the Year 2019"]
    },
    {
      id: 4,
      name: "David Thompson",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      title: "Investment Property Expert",
      specialty: "investment",
      experience: 15,
      rating: 4.7,
      reviews: 178,
      phone: "+1 (555) 456-7890",
      email: "david.thompson@estateease.com",
      languages: ["English"],
      certifications: ["CIPS", "CRS", "GRI"],
      bio: "David has been helping investors build wealth through real estate for over 15 years. He has an extensive network and deep market knowledge that helps clients find the best investment opportunities.",
      sales: 234,
      area: "Multi-Family & Investment Properties",
      achievements: ["Top Investment Agent", "Platinum Producer", "Market Expert Award"]
    },
    {
      id: 5,
      name: "Lisa Park",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
      title: "Luxury Home Specialist",
      specialty: "luxury",
      experience: 10,
      rating: 5.0,
      reviews: 94,
      phone: "+1 (555) 567-8901",
      email: "lisa.park@estateease.com",
      languages: ["English", "Korean", "Japanese"],
      certifications: ["CLHMS", "CRS", "CIPS"],
      bio: "Lisa specializes in high-end luxury properties and waterfront homes. Her discretion, professionalism, and extensive network make her the preferred choice for discerning clients.",
      sales: 78,
      area: "Waterfront & Luxury Estates",
      achievements: ["Luxury Expert", "Waterfront Specialist", "Elite Agent Circle"]
    },
    {
      id: 6,
      name: "James Wilson",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
      title: "Relocation Specialist",
      specialty: "relocation",
      experience: 7,
      rating: 4.8,
      reviews: 112,
      phone: "+1 (555) 678-9012",
      email: "james.wilson@estateease.com",
      languages: ["English", "German"],
      certifications: ["RCC", "CRS", "GRI"],
      bio: "James specializes in helping families relocate from other states and countries. He provides comprehensive relocation services and has partnerships with moving companies and local service providers.",
      sales: 98,
      area: "City-wide Relocation Services",
      achievements: ["Relocation Expert", "International Client Award", "Service Excellence"]
    }
  ];

  const specialties = [
    { key: "all", label: "All Agents", count: agents.length },
    { key: "luxury", label: "Luxury Properties", count: agents.filter(a => a.specialty === "luxury").length },
    { key: "commercial", label: "Commercial", count: agents.filter(a => a.specialty === "commercial").length },
    { key: "residential", label: "Residential", count: agents.filter(a => a.specialty === "residential").length },
    { key: "investment", label: "Investment", count: agents.filter(a => a.specialty === "investment").length },
    { key: "relocation", label: "Relocation", count: agents.filter(a => a.specialty === "relocation").length }
  ];

  const filteredAgents = selectedSpecialty === "all" 
    ? agents 
    : agents.filter(agent => agent.specialty === selectedSpecialty);

  const handleContactAgent = (agent) => {
    // Create mailto link with pre-filled content
    const subject = encodeURIComponent(`Inquiry about Real Estate Services - ${agent.name}`);
    const body = encodeURIComponent(`Hello ${agent.name},

I am interested in your real estate services and would like to schedule a consultation.

Please contact me at your earliest convenience to discuss:
- Property buying/selling assistance
- Market analysis
- Property valuation
- Investment opportunities

Looking forward to hearing from you.

Best regards`);
    
    window.open(`mailto:${agent.email}?subject=${subject}&body=${body}`, '_blank');
  };

  const handleCallAgent = (agent) => {
    // For mobile devices, this will open the phone dialer
    window.open(`tel:${agent.phone}`, '_self');
  };

  const handleViewProperties = (agent) => {
    // Navigate to listings filtered by agent
    window.open(`/list?agent=${agent.name}`, '_blank');
  };

  const handleJoinTeam = () => {
    // Navigate to contact page with career inquiry
    const subject = encodeURIComponent('Career Inquiry - Real Estate Agent Position');
    const body = encodeURIComponent(`Hello EstateEase Team,

I am interested in joining your real estate team as a licensed agent.

Please provide information about:
- Available positions
- Commission structure
- Training programs
- Support and resources
- Application process

I look forward to discussing this opportunity with you.

Best regards`);
    
    window.open(`mailto:careers@estateease.com?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="agents-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Meet Our Expert Agents</h1>
          <p>Our team of professional real estate agents is here to help you achieve your property goals. Each agent brings unique expertise and local market knowledge to serve you better.</p>
        </div>
        
        <div className="stats-banner">
          <div className="stat">
            <div className="stat-number">{agents.length}</div>
            <div className="stat-label">Expert Agents</div>
          </div>
          <div className="stat">
            <div className="stat-number">{agents.reduce((sum, agent) => sum + agent.sales, 0)}</div>
            <div className="stat-label">Properties Sold</div>
          </div>
          <div className="stat">
            <div className="stat-number">{agents.reduce((sum, agent) => sum + agent.experience, 0)}</div>
            <div className="stat-label">Years Combined Experience</div>
          </div>
          <div className="stat">
            <div className="stat-number">{(agents.reduce((sum, agent) => sum + agent.rating, 0) / agents.length).toFixed(1)}</div>
            <div className="stat-label">Average Rating</div>
          </div>
        </div>
      </div>

      <div className="filter-section">
        <h3>Filter by Specialty</h3>
        <div className="specialty-filters">
          {specialties.map(specialty => (
            <button
              key={specialty.key}
              className={`filter-btn ${selectedSpecialty === specialty.key ? 'active' : ''}`}
              onClick={() => setSelectedSpecialty(specialty.key)}
            >
              {specialty.label} ({specialty.count})
            </button>
          ))}
        </div>
      </div>

      <div className="agents-grid">
        {filteredAgents.map(agent => (
          <div key={agent.id} className="agent-card">
            <div className="agent-header">
              <div className="agent-avatar">
                <img src={agent.avatar} alt={agent.name} />
                <div className="online-indicator"></div>
              </div>
              <div className="agent-basic-info">
                <h3>{agent.name}</h3>
                <p className="agent-title">{agent.title}</p>
                <div className="agent-rating">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`star ${i < Math.floor(agent.rating) ? 'filled' : ''}`}>★</span>
                    ))}
                  </div>
                  <span className="rating-text">{agent.rating} ({agent.reviews} reviews)</span>
                </div>
              </div>
            </div>

            <div className="agent-stats">
              <div className="stat-item">
                <span className="stat-value">{agent.experience}</span>
                <span className="stat-label">Years Experience</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{agent.sales}</span>
                <span className="stat-label">Properties Sold</span>
              </div>
            </div>

            <div className="agent-details">
              <div className="detail-section">
                <h4>Specialization</h4>
                <span className="specialty-badge">{agent.specialty.charAt(0).toUpperCase() + agent.specialty.slice(1)}</span>
              </div>

              <div className="detail-section">
                <h4>Service Area</h4>
                <p>{agent.area}</p>
              </div>

              <div className="detail-section">
                <h4>Languages</h4>
                <div className="languages">
                  {agent.languages.map(lang => (
                    <span key={lang} className="language-tag">{lang}</span>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <h4>Certifications</h4>
                <div className="certifications">
                  {agent.certifications.map(cert => (
                    <span key={cert} className="cert-tag">{cert}</span>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <h4>About</h4>
                <p className="agent-bio">{agent.bio}</p>
              </div>

              <div className="detail-section">
                <h4>Recent Achievements</h4>
                <ul className="achievements">
                  {agent.achievements.map(achievement => (
                    <li key={achievement}>🏆 {achievement}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="agent-contact">
              <div className="contact-info">
                <div className="contact-item">
                  <span className="contact-icon">📞</span>
                  <span>{agent.phone}</span>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">✉️</span>
                  <span>{agent.email}</span>
                </div>
              </div>
              
              <div className="contact-buttons">
                <button 
                  className="btn-primary"
                  onClick={() => handleContactAgent(agent)}
                  title={`Send email to ${agent.name}`}
                >
                  📧 Email Agent
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => handleCallAgent(agent)}
                  title={`Call ${agent.name}`}
                >
                  📞 Call Agent
                </button>
              </div>
              <div className="additional-actions">
                <button 
                  className="btn-outline"
                  onClick={() => handleViewProperties(agent)}
                  title={`View properties by ${agent.name}`}
                >
                  🏠 View Properties
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="join-team-section">
        <div className="join-content">
          <h2>Join Our Team</h2>
          <p>Are you a licensed real estate professional looking to take your career to the next level? Join our award-winning team and benefit from our proven systems, cutting-edge technology, and exceptional support.</p>
          <div className="join-benefits">
            <div className="benefit">✓ Competitive commission splits</div>
            <div className="benefit">✓ Comprehensive training programs</div>
            <div className="benefit">✓ Advanced marketing tools</div>
            <div className="benefit">✓ Dedicated support team</div>
          </div>
          <button 
            className="btn-primary"
            onClick={handleJoinTeam}
            title="Send career inquiry email"
          >
            💼 Apply Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default Agents;
