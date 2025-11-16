import "./singlePage.scss";
import Slider from "../../components/slider/Slider";
import Map from "../../components/map/Map";
import ScrollAnimations from "../../components/ScrollAnimations/ScrollAnimations";
import { useNavigate, useLoaderData } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DOMPurify from "dompurify";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useFavorites } from "../../context/FavoritesContext";
import { useRecommendations } from "../../context/RecommendationsContext";
import { useCurrency } from "../../context/CurrencyContext";
import { useChatContext } from "../../context/ChatContext";
import apiRequest from "../../lib/apiRequest";
import toast from "react-hot-toast";
import PriceAlert from "../../components/priceAlert/PriceAlert";
import Avatar from "../../components/Avatar/Avatar";
import VisitBooking from "../../components/visitBooking/VisitBookingClean";
import PropertyWeather from "../../components/weather/PropertyWeather";
import PriceHistoryChart from "../../components/PriceHistoryChart/PriceHistoryChart";
import ShareButtons from "../../components/ShareButtons/ShareButtons";
import NearbyPlaces from "../../components/nearbyPlaces/NearbyPlaces";

function SinglePage() {
  const { t } = useTranslation();
  const post = useLoaderData();
  const [saved, setSaved] = useState(post.isSaved);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [mortgageData, setMortgageData] = useState({
    loanAmount: post.price * 0.8,
    interestRate: 4.5,
    loanTerm: 30
  });
  const { currentUser } = useContext(AuthContext);
  const { isFavorite, toggleFavorite, shareProperty } = useFavorites();
  const { addToViewingHistory } = useRecommendations();
  const { formatPrice } = useCurrency();
  const { setChat } = useChatContext();
  const navigate = useNavigate();
  const [showVisitBooking, setShowVisitBooking] = useState(false);
  const [contactForm, setContactForm] = useState({ name: currentUser?.username || "", email: currentUser?.email || "", message: "" });
  const [contactSending, setContactSending] = useState(false);

  // Add to viewing history when component mounts
  useEffect(() => {
    if (post) {
      addToViewingHistory(post);
    }
  }, [post.id, addToViewingHistory]);

  const handleSave = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    const newSaved = !saved;
    setSaved(newSaved);
    try {
      await apiRequest.post("/users/save", { postId: post.id });
      toast.success(newSaved ? "Property saved!" : "Property removed from saved");
    } catch (err) {
      console.error("Save failed:", err);
      setSaved((prev) => !prev);
      toast.error("Failed to save property");
    }
  };

  const handleChat = async () => {
    if (!currentUser) { navigate("/login"); return; }
    if (currentUser.id === post.userId) return;
    try {
      const res = await apiRequest.post("/chats", { receiverId: post.userId });
      setChat({ ...res.data, receiver: post.user });
      toast.success("Chat opened!");
      navigate("/");
    } catch (err) {
      console.error("Failed to start chat:", err);
      toast.error("Failed to open chat");
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactSending(true);
    try {
      await apiRequest.post("/contact", {
        ...contactForm,
        postId: post.id,
        agentUsername: post.user?.username,
      });
      toast.success("Message sent to agent!");
      setContactForm((p) => ({ ...p, message: "" }));
    } catch {
      toast.error("Failed to send message. Try again.");
    } finally {
      setContactSending(false);
    }
  };

  const handleVisitBookingComplete = (booking) => {
    toast.success(`Booking confirmed! ${booking.confirmationNumber}`, { duration: 5000 });
    // Modal stays open so user sees step 3 — they close it manually
  };

  // Helper functions for features and amenities
  const getAmenityIcon = (amenity) => {
    const amenityIcons = {
      'parking': '🚗',
      'gym': '🏋️',
      'pool': '🏊',
      'elevator': '🛗',
      'security': '🔒',
      'laundry': '🧺',
      'balcony': '🌿',
      'ac': '❄️',
      'heating': '🔥',
      'internet': '🌐',
      'pets': '🐕',
      'furnished': '🪑',
      'garden': '🌱',
      'terrace': '🏞️',
      'concierge': '🧑‍💼'
    };
    
    const key = amenity.toLowerCase().replace(/\s+/g, '');
    return amenityIcons[key] || '🏠';
  };

  const getFeatureIcon = (feature) => {
    const featureIcons = {
      'kitchen': '🍳',
      'bathroom': '🛁',
      'bedroom': '🛏️',
      'living': '🛋️',
      'dining': '🍽️',
      'office': '💼',
      'storage': '📦',
      'closet': '👔',
      'fireplace': '🔥',
      'hardwood': '🪵',
      'carpet': '🧶',
      'tile': '🔲',
      'granite': '⚫',
      'marble': '⚪',
      'stainless': '✨',
      'updated': '🔄',
      'modern': '✨',
      'spacious': '📏',
      'bright': '☀️',
      'quiet': '🔇'
    };
    
    const key = feature.toLowerCase().replace(/\s+/g, '');
    return featureIcons[key] || '🏠';
  };

  const formatFeatureName = (name) => {
    // Convert camelCase or snake_case to proper title case
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
  };

  // Mock agent data (in real app, would come from API)
  const agent = {
    id: post.userId,
    name: post.user?.username || "Property Agent",
    avatar: post.user?.avatar || "/noavatar.jpg",
    phone: "+1 (555) 123-4567",
    email: "agent@realestate.com"
  };

  return (
    <div className="singlePage">
      <ScrollAnimations />

      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      <div className="sp-layout">

        {/* ── LEFT: main content ─────────────────────────────── */}
        <div className="sp-main">

          {/* Slider */}
          <div className="sp-slider slide-left">
            <Slider images={post.images} />
          </div>

          {/* Title / address / price / agent */}
          <div className="sp-info slide-right fade-up">
            <div className="sp-top">
              <div className="post">
                <h1>{post.title}</h1>
                <div className="address">
                  <img src="/pin.png" alt="Location" />
                  <span>{post.address}</span>
                </div>
                <div className="price">{formatPrice(post.price)}</div>
              </div>
              <div className="user">
                <Avatar src={post.user?.avatar} username={post.user?.username} size={40} />
                <span>{post.user?.username}</span>
              </div>
            </div>

            <div
              className="sp-desc"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(post.postDetail?.desc || post.description || t('property.noDescription')),
              }}
            />
          </div>

          {/* ── Tabs: full-width inside the left column ── */}
          <div className="enhanced-details fade-up">
            <div className="tabs">
              {[
                ['overview',      'Overview'],
                ['neighborhood',  'Neighborhood'],
                ['features',      'Features & Amenities'],
                ['floorplan',     'Floor Plan'],
                ['virtual-tour',  'Virtual Tour'],
                ['mortgage',      'Mortgage Calculator'],
                ['history',       'Price History'],
                ['weather',       '🌤️ Weather'],
                ['nearby',        '📍 Nearby Places'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  className={activeTab === key ? 'active' : ''}
                  onClick={() => setActiveTab(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="tab-content">
              {activeTab === 'overview' && (
                <div className="overview-tab">
                  <h3>Property Overview</h3>
                  <div className="overview-grid">
                    {[
                      ['Property Type', post.type ? post.type.charAt(0).toUpperCase() + post.type.slice(1) : 'N/A'],
                      ['Year Built',    post.yearBuilt || 'N/A'],
                      ['Size',          post.size ? `${post.size} sq ft` : 'N/A'],
                      ['Bedrooms',      post.bedroom ?? 'N/A'],
                      ['Bathrooms',     post.bathroom ?? 'N/A'],
                      ['Pet Policy',    post.petPolicy === 'allowed' ? 'Pets Allowed' : 'No Pets'],
                      ['Utilities',     post.utilities === 'included' ? 'Included' : 'Tenant Pays'],
                    ].map(([k, v]) => (
                      <div key={k} className="overview-item">
                        <strong>{k}:</strong>
                        <span>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'neighborhood' && (
                <div className="neighborhood-tab">
                  <h3>Neighborhood Information</h3>
                  {post.neighborhood ? (
                    <div className="neighborhood-sections">
                      <div className="neighborhood-section">
                        <h4>🏫 Schools</h4>
                        <ul>
                          {post.neighborhood.schools?.map((school, i) => (
                            <li key={i}>
                              <span className="place-name">{school.name}</span>
                              <span className="place-distance">{school.distance}</span>
                              <span className="place-rating">★ {school.rating}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="neighborhood-section">
                        <h4>🏥 Healthcare</h4>
                        <ul>
                          {post.neighborhood.healthcare?.map((p, i) => (
                            <li key={i}>
                              <span className="place-name">{p.name}</span>
                              <span className="place-distance">{p.distance}</span>
                              <span className="place-type">{p.type}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="neighborhood-section">
                        <h4>🚌 Transportation</h4>
                        <ul>
                          {post.neighborhood.transport?.map((p, i) => (
                            <li key={i}>
                              <span className="place-name">{p.name}</span>
                              <span className="place-distance">{p.distance}</span>
                              <span className="place-type">{p.type}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="neighborhood-section">
                        <h4>🛒 Shopping</h4>
                        <ul>
                          {post.neighborhood.shopping?.map((p, i) => (
                            <li key={i}>
                              <span className="place-name">{p.name}</span>
                              <span className="place-distance">{p.distance}</span>
                              <span className="place-type">{p.type}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="neighborhood-section">
                        <h4>🛡️ Safety & Walkability</h4>
                        <div className="safety-scores">
                          <div className="score-item">
                            <span className="score-label">Safety Score</span>
                            <span className="score-value">{post.neighborhood.safetyScore || 8}/10</span>
                          </div>
                          <div className="score-item">
                            <span className="score-label">Walk Score</span>
                            <span className="score-value">{post.neighborhood.walkScore || 75}/100</span>
                          </div>
                          <div className="score-item">
                            <span className="score-label">Transit Score</span>
                            <span className="score-value">{post.neighborhood.transitScore || 65}/100</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="default-neighborhood">
                      <p>Neighborhood information will be available soon.</p>
                      <div className="nearby-basics">
                        <div className="basic-item"><span>🏫 Schools within 2km</span></div>
                        <div className="basic-item"><span>🛒 Shopping centers nearby</span></div>
                        <div className="basic-item"><span>🚌 Public transportation accessible</span></div>
                        <div className="basic-item"><span>🏥 Healthcare facilities in area</span></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'features' && (
                <div className="features-tab">
                  <h3>Features & Amenities</h3>
                  <div className="features-grid">
                    <div className="feature-category">
                      <h4>🏢 Building Amenities</h4>
                      <div className="amenities-list">
                        {post.amenities && post.amenities.length > 0 ? (
                          post.amenities.map((a, i) => (
                            <span key={i} className="amenity-tag">{getAmenityIcon(a)} {formatFeatureName(a)}</span>
                          ))
                        ) : (
                          <div className="default-amenities">
                            <span className="amenity-tag">🚗 Parking Available</span>
                            <span className="amenity-tag">🛗 Elevator Access</span>
                            <span className="amenity-tag">🔒 Security System</span>
                            <span className="amenity-tag">🌐 High-Speed Internet</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="feature-category">
                      <h4>🏠 Property Features</h4>
                      <div className="features-list">
                        {post.features && post.features.length > 0 ? (
                          post.features.map((f, i) => (
                            <span key={i} className="feature-tag">{getFeatureIcon(f)} {formatFeatureName(f)}</span>
                          ))
                        ) : (
                          <div className="default-features">
                            <span className="feature-tag">🏠 Modern Kitchen</span>
                            <span className="feature-tag">🛁 Updated Bathroom</span>
                            <span className="feature-tag">🌿 Natural Light</span>
                            <span className="feature-tag">🎯 Prime Location</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'floorplan' && (
                <div className="floorplan-tab">
                  <h3>📐 Floor Plan</h3>
                  {post.floorPlan ? (
                    <div className="floorplan-container">
                      <div className="floorplan-info">
                        <p>View the detailed architectural floor plan for this property</p>
                        <div className="property-specs">
                          <span className="spec-item"><strong>Total Area:</strong> {post.postDetail?.size || post.size} sq ft</span>
                          <span className="spec-item"><strong>Bedrooms:</strong> {post.bedroom || post.bedRooms}</span>
                          <span className="spec-item"><strong>Bathrooms:</strong> {post.bathroom}</span>
                        </div>
                      </div>
                      <div className="floorplan-button-container">
                        <button className="floorplan-btn" onClick={() => window.open(post.floorPlan, '_blank')}>
                          <span className="btn-icon">📐</span>
                          <span className="btn-text">View Floor Plan</span>
                          <span className="btn-subtitle">Opens in new window</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="no-floorplan">
                      <div className="no-floorplan-icon">📐</div>
                      <p>Floor plan not available for this property.</p>
                      <small>Contact the agent for detailed layout information.</small>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'virtual-tour' && (
                <div className="virtual-tour-tab">
                  <h3>Virtual Tour</h3>
                  {post.virtualTour ? (
                    <div className="virtual-tour-container">
                      <p>Experience this property in 3D</p>
                      <button className="virtual-tour-btn" onClick={() => window.open(post.virtualTour, '_blank')}>
                        🏠 Launch Virtual Tour
                      </button>
                    </div>
                  ) : (
                    <p>Virtual tour not available for this property.</p>
                  )}
                </div>
              )}

              {activeTab === 'mortgage' && (() => {
                const downPct = mortgageData.downPaymentPct ?? 20;
                const downAmt = Math.round(post.price * downPct / 100);
                const loan = post.price - downAmt;
                const r = mortgageData.interestRate / 100 / 12;
                const n = mortgageData.loanTerm * 12;
                const monthly = r === 0 ? loan / n : (loan * r * Math.pow(1+r,n)) / (Math.pow(1+r,n)-1);
                const totalPaid = monthly * n;
                const totalInterest = totalPaid - loan;
                const principalPct = Math.round((loan / totalPaid) * 100);
                const fmt = (v) => new Intl.NumberFormat("en-US", { style:"currency", currency:"USD", maximumFractionDigits:0 }).format(v);
                return (
                  <div className="mortgage-tab">
                    <h3>Mortgage Calculator</h3>
                    <div className="mortgage-calculator">
                      <div className="mortgage-inputs">
                        <div className="input-group">
                          <label>Property Price</label>
                          <input type="text" value={fmt(post.price)} disabled style={{ background:"#f5f5f5", color:"#888" }} />
                        </div>
                        <div className="input-group">
                          <label>Down Payment: {downPct}% ({fmt(downAmt)})</label>
                          <input type="range" min={5} max={50} step={5}
                            value={downPct}
                            onChange={(e) => setMortgageData({...mortgageData, downPaymentPct: +e.target.value})}
                            style={{ width:"100%", accentColor:"#1a1a2e" }}
                          />
                        </div>
                        <div className="input-group">
                          <label>Interest Rate (%)</label>
                          <input type="number" step="0.1" min={0.1} max={20}
                            value={mortgageData.interestRate}
                            onChange={(e) => setMortgageData({...mortgageData, interestRate: +e.target.value})}
                          />
                        </div>
                        <div className="input-group">
                          <label>Loan Term (years)</label>
                          <select value={mortgageData.loanTerm}
                            onChange={(e) => setMortgageData({...mortgageData, loanTerm: +e.target.value})}
                          >
                            {[10,15,20,25,30].map(y => <option key={y} value={y}>{y} years</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="mortgage-results">
                        <div className="result-item" style={{ fontSize:"1.6rem", fontWeight:700, color:"#1a1a2e", marginBottom:"1rem" }}>
                          {fmt(monthly)}<span style={{ fontSize:"0.9rem", fontWeight:400, color:"#888" }}>/month</span>
                        </div>
                        <div className="result-item"><strong>Loan Amount:</strong><span>{fmt(loan)}</span></div>
                        <div className="result-item"><strong>Down Payment:</strong><span>{fmt(downAmt)} ({downPct}%)</span></div>
                        <div className="result-item"><strong>Total Payments:</strong><span>{fmt(totalPaid)}</span></div>
                        <div className="result-item"><strong>Total Interest:</strong><span style={{ color:"#ef4444" }}>{fmt(totalInterest)}</span></div>
                        <div style={{ margin:"1.2rem 0 0.4rem", fontSize:"13px", color:"#666" }}>Principal vs Interest</div>
                        <div style={{ display:"flex", height:"12px", borderRadius:"6px", overflow:"hidden" }}>
                          <div style={{ width:`${principalPct}%`, background:"#1a1a2e" }} />
                          <div style={{ width:`${100-principalPct}%`, background:"#ef4444" }} />
                        </div>
                        <div style={{ display:"flex", gap:"1.5rem", marginTop:"6px", fontSize:"12px", color:"#666" }}>
                          <span>🟦 Principal {principalPct}%</span>
                          <span>🟥 Interest {100-principalPct}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {activeTab === 'history' && (
                <div className="history-tab">
                  <h3>Price History</h3>
                  {post.priceHistory && post.priceHistory.length > 0 ? (
                    <div className="price-history">
                      <div className="history-chart">
                        {post.priceHistory.map((entry, i) => (
                          <div key={i} className="history-entry">
                            <div className="history-date">{new Date(entry.date).toLocaleDateString()}</div>
                            <div className="history-price">${entry.price}</div>
                            <div className="history-change">
                              {i > 0 && (
                                <span className={entry.price > post.priceHistory[i - 1].price ? 'increase' : 'decrease'}>
                                  {entry.price > post.priceHistory[i - 1].price ? '↗' : '↘'}
                                  ${Math.abs(entry.price - post.priceHistory[i - 1].price)}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p>Price history not available for this property.</p>
                  )}
                </div>
              )}

              {activeTab === 'weather' && (
                <div className="weather-tab">
                  <PropertyWeather latitude={post.latitude} longitude={post.longitude} property={post} />
                </div>
              )}

              {activeTab === 'nearby' && (
                <div className="nearby-tab">
                  <h3>📍 Nearby Places</h3>
                  <NearbyPlaces latitude={post.latitude} longitude={post.longitude} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: sticky sidebar ───────────────────────────── */}
        <div className="sp-sidebar">

          {/* General info */}
          <div className="sidebar-card">
            <p className="title">{t('property.general')}</p>
            <div className="listVertical">
              <div className="feature">
                <img src="/utility.png" alt="Utilities" />
                <div className="featureText">
                  <span>{t('property.utilities')}</span>
                  <p>
                    {post.utilities === "included" ? t('property.utilitiesIncluded')
                      : post.utilities === "owner" ? t('property.ownerResponsible')
                      : post.postDetail?.utilities === "owner" ? t('property.ownerResponsible')
                      : post.postDetail?.utilities === "included" ? t('property.utilitiesIncluded')
                      : t('property.tenantResponsible')}
                  </p>
                </div>
              </div>
              <div className="feature">
                <img src="/pet.png" alt="Pet Policy" />
                <div className="featureText">
                  <span>{t('property.petPolicy')}</span>
                  <p>{post.petPolicy === "allowed" || post.postDetail?.pet === "allowed" ? t('property.petsAllowed') : t('property.petsNotAllowed')}</p>
                </div>
              </div>
              <div className="feature">
                <img src="/fee.png" alt="Income" />
                <div className="featureText">
                  <span>{t('property.incomePolicy')}</span>
                  <p>{post.postDetail?.income || t('property.standardIncomeRequirements')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sizes */}
          <div className="sidebar-card">
            <p className="title">{t('property.sizes')}</p>
            <div className="sizes">
              <div className="size">
                <img src="/size.png" alt="Size" />
                <span>{post.size || post.postDetail?.size || 'N/A'} sqft</span>
              </div>
              <div className="size">
                <img src="/bed.png" alt="Bedroom" />
                <span>{post.bedroom} {post.bedroom === 1 ? t('search.bedroom') : t('search.bedrooms')}</span>
              </div>
              <div className="size">
                <img src="/bath.png" alt="Bathroom" />
                <span>{post.bathroom} {post.bathroom === 1 ? t('search.bathroom') : t('search.bathrooms')}</span>
              </div>
            </div>
          </div>

          {/* Nearby places */}
          <div className="sidebar-card">
            <p className="title">{t('property.nearbyPlaces')}</p>
            <div className="listHorizontal">
              <div className="feature">
                <img src="/school.png" alt="School" />
                <div className="featureText">
                  <span>{t('property.school')}</span>
                  <p>{post.postDetail.school > 999 ? post.postDetail.school / 1000 + " km" : post.postDetail.school + " m"} {t('property.away')}</p>
                </div>
              </div>
              <div className="feature">
                <img src="/bus.png" alt="Bus" />
                <div className="featureText">
                  <span>{t('property.busStop')}</span>
                  <p>{post.postDetail.bus}m {t('property.away')}</p>
                </div>
              </div>
              <div className="feature">
                <img src="/restaurant.png" alt="Restaurant" />
                <div className="featureText">
                  <span>{t('property.restaurant')}</span>
                  <p>{post.postDetail.restaurant}m {t('property.away')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="sidebar-card">
            <p className="title">{t('property.location')}</p>
            <div className="mapContainer">
              <Map items={[post]} />
            </div>
          </div>

          {/* Share */}
          <div className="sidebar-card">
            <ShareButtons title={post.title} price={formatPrice(post.price)} />
          </div>

          {/* Price History Chart */}
          <div className="sidebar-card">
            <PriceHistoryChart postId={post.id} currentPrice={post.price} />
          </div>

          {/* Price Alerts */}
          {currentUser && (
            <div className="sidebar-card">
              <p className="title">{t('property.priceAlerts')}</p>
              <PriceAlert property={post} />
            </div>
          )}

          {/* Action buttons */}
          <div className="sidebar-card">
            <div className="buttons">
              <button className="visit-btn" onClick={() => setShowVisitBooking(true)}>
                <span>🏠</span>
                {t('property.scheduleVisit')}
              </button>
              <button className="btn-similar-properties" onClick={() => navigate(`/recommendations/${post.id}`)}>
                🏠 {t('property.similarProperties')}
              </button>
              <button className="chat-btn" onClick={handleChat}>
                <img src="/chat.png" alt="Chat" />
                {t('property.sendMessage')}
              </button>
              <button onClick={handleSave} className={`save-btn ${saved ? 'saved' : ''}`}>
                <img src="/save.png" alt="Save" />
                {saved ? t('property.placeSaved') : t('property.savePlace')}
              </button>
              <button onClick={() => toggleFavorite(post)} className={`favorite-btn ${isFavorite(post.id) ? 'favorited' : ''}`}>
                <img src="/save.png" alt="Favorite" />
                {isFavorite(post.id) ? t('property.favorited') : t('common.addToFavorites')}
              </button>
              <button className="share-btn" onClick={() => shareProperty(post)}>
                <span>📤</span>
                {t('common.shareProperty')}
              </button>
            </div>
          </div>

          {/* Contact Agent */}
          <div className="sidebar-card contact-form">
            <p className="title">Contact Agent</p>
            <form onSubmit={handleContactSubmit}>
              <input
                type="text" placeholder="Your name" required
                value={contactForm.name}
                onChange={(e) => setContactForm((p) => ({ ...p, name: e.target.value }))}
              />
              <input
                type="email" placeholder="Your email" required
                value={contactForm.email}
                onChange={(e) => setContactForm((p) => ({ ...p, email: e.target.value }))}
              />
              <textarea
                placeholder="Write your message..." required rows={3}
                value={contactForm.message}
                onChange={(e) => setContactForm((p) => ({ ...p, message: e.target.value }))}
              />
              <button type="submit" disabled={contactSending} className="contact-submit">
                {contactSending ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Visit Booking Modal */}
      {showVisitBooking && (
        <VisitBooking
          property={post}
          agent={agent}
          onClose={() => setShowVisitBooking(false)}
          onBookingComplete={handleVisitBookingComplete}
        />
      )}
    </div>
  );
}

export default SinglePage;
