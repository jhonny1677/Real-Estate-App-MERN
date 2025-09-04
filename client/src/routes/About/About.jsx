import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./about.scss";

function About() {
  const [activeTab, setActiveTab] = useState("story");
  const navigate = useNavigate();

  const handleExploreProperties = () => {
    navigate("/list");
  };

  const handleMeetTeam = () => {
    navigate("/agents");
  };

  const handleStartSearch = () => {
    navigate("/list");
  };

  const handleScheduleConsultation = () => {
    const subject = encodeURIComponent('Real Estate Consultation Request');
    const body = encodeURIComponent(`Hello EstateEase Team,

I would like to schedule a consultation to discuss my real estate needs.

Please contact me to arrange a meeting at your earliest convenience.

Services I'm interested in:
□ Buying a property
□ Selling a property
□ Investment opportunities
□ Market analysis
□ Other: ________________

Best regards`);
    
    window.open(`mailto:consultation@estateease.com?subject=${subject}&body=${body}`, '_blank');
  };

  const companyStats = [
    { number: "15,000+", label: "Properties Sold", icon: "🏠" },
    { number: "25,000+", label: "Happy Clients", icon: "😊" },
    { number: "150+", label: "Expert Agents", icon: "👥" },
    { number: "50+", label: "Cities Covered", icon: "🌍" },
    { number: "$2.5B+", label: "Total Sales Volume", icon: "💰" },
    { number: "12", label: "Years of Excellence", icon: "⭐" }
  ];

  const timeline = [
    {
      year: "2012",
      title: "Company Founded",
      description: "EstateEase was founded with a vision to revolutionize the real estate industry through technology and exceptional service."
    },
    {
      year: "2014",
      title: "Digital Innovation",
      description: "Launched our first mobile app and introduced virtual property tours, setting new industry standards."
    },
    {
      year: "2016",
      title: "National Expansion",
      description: "Expanded operations to 25 major cities across the country, establishing regional offices and local expertise."
    },
    {
      year: "2018",
      title: "AI-Powered Matching",
      description: "Introduced artificial intelligence for property matching and predictive market analysis."
    },
    {
      year: "2020",
      title: "Virtual Revolution",
      description: "Led the industry's digital transformation during the pandemic with comprehensive virtual services."
    },
    {
      year: "2022",
      title: "Global Recognition",
      description: "Received multiple industry awards for innovation and customer service excellence."
    },
    {
      year: "2024",
      title: "Future Forward",
      description: "Launching next-generation features including AR property visualization and blockchain transactions."
    }
  ];

  const leadership = [
    {
      name: "Alexandra Thompson",
      role: "Chief Executive Officer",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b830?w=400&h=400&fit=crop&crop=face",
      bio: "Alexandra brings 20+ years of real estate and technology experience. She previously led digital transformation at major Fortune 500 companies.",
      education: "MBA Harvard Business School, BS Computer Science MIT"
    },
    {
      name: "Marcus Rodriguez",
      role: "Chief Technology Officer",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      bio: "Marcus is a visionary technologist who has revolutionized multiple industries through innovative software solutions and AI implementations.",
      education: "PhD Computer Science Stanford, MS Software Engineering Carnegie Mellon"
    },
    {
      name: "Sarah Chen",
      role: "Chief Operating Officer",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
      bio: "Sarah oversees global operations and has scaled numerous companies from startup to multi-billion dollar enterprises.",
      education: "MBA Wharton School, BS Operations Management UC Berkeley"
    },
    {
      name: "David Wilson",
      role: "Chief Financial Officer",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      bio: "David brings deep financial expertise and has successfully managed IPOs and major acquisitions for technology companies.",
      education: "CPA, MBA Finance Columbia Business School, BS Accounting NYU"
    }
  ];

  const awards = [
    {
      year: "2024",
      title: "Real Estate Innovation Award",
      organization: "National Association of Realtors",
      description: "For pioneering AI-driven property matching technology"
    },
    {
      year: "2023",
      title: "Best Customer Service Excellence",
      organization: "Real Estate Business Awards",
      description: "Highest customer satisfaction scores in the industry"
    },
    {
      year: "2023",
      title: "Top PropTech Company",
      organization: "TechCrunch Real Estate",
      description: "Leading innovation in property technology solutions"
    },
    {
      year: "2022",
      title: "Fastest Growing Real Estate Platform",
      organization: "Inc. 5000",
      description: "300% growth over three consecutive years"
    },
    {
      year: "2022",
      title: "Digital Transformation Leader",
      organization: "Forbes Technology Awards",
      description: "Excellence in digital real estate solutions"
    }
  ];

  const values = [
    {
      icon: "🎯",
      title: "Integrity First",
      description: "We conduct business with unwavering honesty, transparency, and ethical standards in every interaction."
    },
    {
      icon: "🚀",
      title: "Innovation Driven",
      description: "We continuously push boundaries with cutting-edge technology to enhance the real estate experience."
    },
    {
      icon: "🤝",
      title: "Client Centric",
      description: "Every decision we make is guided by our commitment to serving our clients' best interests."
    },
    {
      icon: "🌟",
      title: "Excellence Always",
      description: "We strive for perfection in service delivery and maintain the highest professional standards."
    },
    {
      icon: "🌍",
      title: "Community Focus",
      description: "We believe in building stronger communities through responsible real estate practices."
    },
    {
      icon: "📈",
      title: "Results Oriented",
      description: "We measure success by the achievement of our clients' real estate goals and dreams."
    }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Redefining Real Estate Excellence</h1>
            <p className="hero-subtitle">
              For over a decade, EstateEase has been the trusted partner for thousands of families, 
              investors, and businesses in their real estate journey. We combine cutting-edge technology 
              with personalized service to deliver exceptional results.
            </p>
            <div className="hero-buttons">
              <button 
                className="btn-primary"
                onClick={handleExploreProperties}
                title="Browse our property listings"
              >
                🏠 Explore Properties
              </button>
              <button 
                className="btn-secondary"
                onClick={handleMeetTeam}
                title="Meet our professional agents"
              >
                👥 Meet Our Team
              </button>
            </div>
          </div>
          <div className="hero-image">
            <img src="https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800&h=600&fit=crop" alt="Modern office building" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <h2>Our Impact in Numbers</h2>
          <div className="stats-grid">
            {companyStats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="content-section">
        <div className="content-container">
          <div className="content-tabs">
            <button 
              className={`tab-btn ${activeTab === 'story' ? 'active' : ''}`}
              onClick={() => setActiveTab('story')}
            >
              Our Story
            </button>
            <button 
              className={`tab-btn ${activeTab === 'leadership' ? 'active' : ''}`}
              onClick={() => setActiveTab('leadership')}
            >
              Leadership
            </button>
            <button 
              className={`tab-btn ${activeTab === 'values' ? 'active' : ''}`}
              onClick={() => setActiveTab('values')}
            >
              Values & Mission
            </button>
            <button 
              className={`tab-btn ${activeTab === 'awards' ? 'active' : ''}`}
              onClick={() => setActiveTab('awards')}
            >
              Awards & Recognition
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'story' && (
              <div className="story-content">
                <div className="story-intro">
                  <h2>The EstateEase Journey</h2>
                  <p>
                    What started as a simple idea to make real estate more accessible has evolved into 
                    a comprehensive platform that serves millions of users worldwide. Our journey is 
                    marked by continuous innovation, unwavering commitment to excellence, and a 
                    deep understanding of our clients' needs.
                  </p>
                </div>

                <div className="mission-vision">
                  <div className="mission">
                    <h3>🎯 Our Mission</h3>
                    <p>
                      To democratize real estate by providing innovative technology solutions that 
                      make property transactions transparent, efficient, and accessible to everyone, 
                      regardless of their experience level or budget.
                    </p>
                  </div>
                  <div className="vision">
                    <h3>🔮 Our Vision</h3>
                    <p>
                      To be the world's most trusted real estate platform, where every property 
                      transaction is seamless, every client is empowered with knowledge, and every 
                      community thrives through responsible development.
                    </p>
                  </div>
                </div>

                <div className="timeline-section">
                  <h3>Our Milestones</h3>
                  <div className="timeline">
                    {timeline.map((item, index) => (
                      <div key={index} className="timeline-item">
                        <div className="timeline-year">{item.year}</div>
                        <div className="timeline-content">
                          <h4>{item.title}</h4>
                          <p>{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'leadership' && (
              <div className="leadership-content">
                <h2>Meet Our Leadership Team</h2>
                <p className="leadership-intro">
                  Our executive team brings together decades of experience in real estate, 
                  technology, and business leadership. Together, they guide EstateEase's 
                  strategic vision and day-to-day operations.
                </p>
                <div className="leadership-grid">
                  {leadership.map((leader, index) => (
                    <div key={index} className="leader-card">
                      <div className="leader-photo">
                        <img src={leader.image} alt={leader.name} />
                      </div>
                      <div className="leader-info">
                        <h3>{leader.name}</h3>
                        <h4>{leader.role}</h4>
                        <p className="leader-bio">{leader.bio}</p>
                        <div className="leader-education">
                          <strong>Education:</strong> {leader.education}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'values' && (
              <div className="values-content">
                <h2>Our Core Values</h2>
                <p className="values-intro">
                  These fundamental principles guide every decision we make and every 
                  interaction we have with our clients, partners, and communities.
                </p>
                <div className="values-grid">
                  {values.map((value, index) => (
                    <div key={index} className="value-card">
                      <div className="value-icon">{value.icon}</div>
                      <h3>{value.title}</h3>
                      <p>{value.description}</p>
                    </div>
                  ))}
                </div>

                <div className="sustainability-section">
                  <h3>🌱 Sustainability Commitment</h3>
                  <div className="sustainability-content">
                    <p>
                      We're committed to promoting sustainable real estate practices and 
                      environmental responsibility. Our initiatives include:
                    </p>
                    <ul>
                      <li>Promoting energy-efficient and green building certifications</li>
                      <li>Reducing paper usage through digital transaction processes</li>
                      <li>Supporting sustainable community development projects</li>
                      <li>Offsetting our carbon footprint through renewable energy investments</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'awards' && (
              <div className="awards-content">
                <h2>Recognition & Awards</h2>
                <p className="awards-intro">
                  We're proud to be recognized by industry leaders for our innovation, 
                  service excellence, and positive impact on the real estate industry.
                </p>
                <div className="awards-list">
                  {awards.map((award, index) => (
                    <div key={index} className="award-item">
                      <div className="award-year">{award.year}</div>
                      <div className="award-details">
                        <h3>{award.title}</h3>
                        <h4>{award.organization}</h4>
                        <p>{award.description}</p>
                      </div>
                      <div className="award-trophy">🏆</div>
                    </div>
                  ))}
                </div>

                <div className="certifications-section">
                  <h3>Industry Certifications</h3>
                  <div className="certifications-grid">
                    <div className="cert-item">
                      <div className="cert-logo">🛡️</div>
                      <h4>ISO 27001 Certified</h4>
                      <p>Information Security Management</p>
                    </div>
                    <div className="cert-item">
                      <div className="cert-logo">✅</div>
                      <h4>SOC 2 Type II Compliant</h4>
                      <p>Data Security & Availability</p>
                    </div>
                    <div className="cert-item">
                      <div className="cert-logo">🏢</div>
                      <h4>REALTOR® Association</h4>
                      <p>Member in Good Standing</p>
                    </div>
                    <div className="cert-item">
                      <div className="cert-logo">🔒</div>
                      <h4>GDPR Compliant</h4>
                      <p>Privacy Protection Standards</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Experience the EstateEase Difference?</h2>
          <p>
            Join thousands of satisfied clients who have trusted us with their real estate needs. 
            Whether you're buying, selling, or investing, we're here to make your journey smooth and successful.
          </p>
          <div className="cta-buttons">
            <button 
              className="btn-primary"
              onClick={handleStartSearch}
              title="Browse available properties"
            >
              🔍 Start Your Property Search
            </button>
            <button 
              className="btn-secondary"
              onClick={handleScheduleConsultation}
              title="Schedule a consultation with our experts"
            >
              📅 Schedule a Consultation
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
