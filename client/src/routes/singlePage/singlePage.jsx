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
import apiRequest from "../../lib/apiRequest";
import PriceAlert from "../../components/priceAlert/PriceAlert";
import VisitBooking from "../../components/visitBooking/VisitBookingClean";
import PropertyWeather from "../../components/weather/PropertyWeather";

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
  const navigate = useNavigate();
  const [showVisitBooking, setShowVisitBooking] = useState(false);

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

    setSaved((prev) => !prev);
    try {
      await apiRequest.post("/users/save", { postId: post.id });
    } catch (err) {
      console.error("Save failed:", err);
      setSaved((prev) => !prev);
    }
  };

  const handleVisitBookingComplete = (booking) => {
    console.log('Visit booked:', booking);
    // Could show a toast notification here
    setShowVisitBooking(false);
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
      <div className="details">
        <div className="wrapper">
          <div className="slide-left">
            <Slider images={post.images} />
          </div>

          <div className="info slide-right">
            <div className="top fade-up">
              <div className="post">
                <h1>{post.title}</h1>
                <div className="address">
                  <img src="/pin.png" alt="Location" />
                  <span>{post.address}</span>
                </div>
                <div className="price">{formatPrice(post.price)}</div>
              </div>
              <div className="user">
                <img
                  src={
                    post.user.avatar ||
                    "https://www.w3schools.com/howto/img_avatar.png"
                  }
                  alt="User Avatar"
                />
                <span>{post.user.username}</span>
              </div>
            </div>

            <div
              className="bottom fade-up"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(post.postDetail?.desc || post.description || t('property.noDescription')),
              }}
            ></div>
          </div>
        </div>
      </div>

      <div className="features fade-up">
        <div className="wrapper">
          <p className="title">{t('property.general')}</p>
          <div className="listVertical">
            <div className="feature">
              <img src="/utility.png" alt="Utilities" />
              <div className="featureText">
                <span>{t('property.utilities')}</span>
                <p>
                  {post.utilities === "included" 
                    ? t('property.utilitiesIncluded')
                    : post.utilities === "owner"
                    ? t('property.ownerResponsible') 
                    : post.postDetail?.utilities === "owner"
                    ? t('property.ownerResponsible')
                    : post.postDetail?.utilities === "included"
                    ? t('property.utilitiesIncluded')
                    : t('property.tenantResponsible')}
                </p>
              </div>
            </div>
            <div className="feature">
              <img src="/pet.png" alt="Pet Policy" />
              <div className="featureText">
                <span>{t('property.petPolicy')}</span>
                <p>
                  {post.petPolicy === "allowed" || post.postDetail?.pet === "allowed"
                    ? t('property.petsAllowed')
                    : t('property.petsNotAllowed')}
                </p>
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

          <p className="title">{t('property.nearbyPlaces')}</p>
          <div className="listHorizontal">
            <div className="feature">
              <img src="/school.png" alt="School" />
              <div className="featureText">
                <span>{t('property.school')}</span>
                <p>
                  {post.postDetail.school > 999
                    ? post.postDetail.school / 1000 + " km"
                    : post.postDetail.school + " m"}{" "}
                  {t('property.away')}
                </p>
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

          <p className="title">{t('property.location')}</p>
          <div className="mapContainer">
            <Map items={[post]} />
          </div>

          {/* Price Alert Section */}
          {currentUser && (
            <div className="price-alert-section">
              <p className="title">{t('property.priceAlerts')}</p>
              <PriceAlert property={post} />
            </div>
          )}

          <div className="buttons">
            <button
              className="visit-btn"
              onClick={() => setShowVisitBooking(true)}
            >
              <span>🏠</span>
              {t('property.scheduleVisit')}
            </button>

            <button 
              className="btn-similar-properties"
              onClick={() => navigate(`/recommendations/${post.id}`)}
            >
              🏠 {t('property.similarProperties')}
            </button>

            <button>
              <img src="/chat.png" alt="Chat" />
              {t('property.sendMessage')}
            </button>
            
            <button
              onClick={handleSave}
              className={`save-btn ${saved ? 'saved' : ''}`}
            >
              <img src="/save.png" alt="Save" />
              {saved ? t('property.placeSaved') : t('property.savePlace')}
            </button>
            
            <button
              onClick={() => toggleFavorite(post)}
              className={`favorite-btn ${isFavorite(post.id) ? 'favorited' : ''}`}
            >
              <img src="/save.png" alt="Favorite" />
              {isFavorite(post.id) ? t('property.favorited') : t('common.addToFavorites')}
            </button>
            
            <button onClick={() => shareProperty(post)}>
              <span>📤</span>
              {t('common.shareProperty')}
            </button>
          </div>

          {/* Enhanced Property Details Tabs */}
          <div className="enhanced-details">
            <div className="tabs">
              <button 
                className={activeTab === 'overview' ? 'active' : ''}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button 
                className={activeTab === 'neighborhood' ? 'active' : ''}
                onClick={() => setActiveTab('neighborhood')}
              >
                Neighborhood
              </button>
              <button 
                className={activeTab === 'features' ? 'active' : ''}
                onClick={() => setActiveTab('features')}
              >
                Features & Amenities
              </button>
              <button 
                className={activeTab === 'floorplan' ? 'active' : ''}
                onClick={() => setActiveTab('floorplan')}
              >
                Floor Plan
              </button>
              <button 
                className={activeTab === 'virtual-tour' ? 'active' : ''}
                onClick={() => setActiveTab('virtual-tour')}
              >
                Virtual Tour
              </button>
              <button 
                className={activeTab === 'mortgage' ? 'active' : ''}
                onClick={() => setActiveTab('mortgage')}
              >
                Mortgage Calculator
              </button>
              <button 
                className={activeTab === 'history' ? 'active' : ''}
                onClick={() => setActiveTab('history')}
              >
                Price History
              </button>
              <button 
                className={activeTab === 'weather' ? 'active' : ''}
                onClick={() => setActiveTab('weather')}
              >
                🌤️ Weather
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'overview' && (
                <div className="overview-tab">
                  <h3>Property Overview</h3>
                  <div className="overview-grid">
                    <div className="overview-item">
                      <strong>Property Type:</strong>
                      <span>{post.type?.charAt(0).toUpperCase() + post.type?.slice(1)}</span>
                    </div>
                    <div className="overview-item">
                      <strong>Year Built:</strong>
                      <span>{post.yearBuilt}</span>
                    </div>
                    <div className="overview-item">
                      <strong>Size:</strong>
                      <span>{post.size} sq ft</span>
                    </div>
                    <div className="overview-item">
                      <strong>Bedrooms:</strong>
                      <span>{post.bedroom}</span>
                    </div>
                    <div className="overview-item">
                      <strong>Bathrooms:</strong>
                      <span>{post.bathroom}</span>
                    </div>
                    <div className="overview-item">
                      <strong>Pet Policy:</strong>
                      <span>{post.petPolicy === 'allowed' ? 'Pets Allowed' : 'No Pets'}</span>
                    </div>
                    <div className="overview-item">
                      <strong>Utilities:</strong>
                      <span>{post.utilities === 'included' ? 'Included' : 'Tenant Pays'}</span>
                    </div>
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
                          {post.neighborhood.schools?.map((school, index) => (
                            <li key={index}>
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
                          {post.neighborhood.healthcare?.map((place, index) => (
                            <li key={index}>
                              <span className="place-name">{place.name}</span>
                              <span className="place-distance">{place.distance}</span>
                              <span className="place-type">{place.type}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="neighborhood-section">
                        <h4>🚌 Transportation</h4>
                        <ul>
                          {post.neighborhood.transport?.map((transport, index) => (
                            <li key={index}>
                              <span className="place-name">{transport.name}</span>
                              <span className="place-distance">{transport.distance}</span>
                              <span className="place-type">{transport.type}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="neighborhood-section">
                        <h4>🛒 Shopping</h4>
                        <ul>
                          {post.neighborhood.shopping?.map((shop, index) => (
                            <li key={index}>
                              <span className="place-name">{shop.name}</span>
                              <span className="place-distance">{shop.distance}</span>
                              <span className="place-type">{shop.type}</span>
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
                      <p>Neighborhood information will be available soon. This property is located in a desirable area with good access to amenities.</p>
                      <div className="nearby-basics">
                        <div className="basic-item">
                          <span>🏫 Schools within 2km</span>
                        </div>
                        <div className="basic-item">
                          <span>🛒 Shopping centers nearby</span>
                        </div>
                        <div className="basic-item">
                          <span>🚌 Public transportation accessible</span>
                        </div>
                        <div className="basic-item">
                          <span>🏥 Healthcare facilities in area</span>
                        </div>
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
                          post.amenities.map((amenity, index) => (
                            <span key={index} className="amenity-tag">
                              {getAmenityIcon(amenity)} {formatFeatureName(amenity)}
                            </span>
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
                          post.features.map((feature, index) => (
                            <span key={index} className="feature-tag">
                              {getFeatureIcon(feature)} {formatFeatureName(feature)}
                            </span>
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
                          <span className="spec-item">
                            <strong>Total Area:</strong> {post.postDetail?.size || post.size} sq ft
                          </span>
                          <span className="spec-item">
                            <strong>Bedrooms:</strong> {post.bedroom || post.bedRooms}
                          </span>
                          <span className="spec-item">
                            <strong>Bathrooms:</strong> {post.bathroom}
                          </span>
                        </div>
                      </div>
                      <div className="floorplan-button-container">
                        <button 
                          className="floorplan-btn"
                          onClick={() => window.open(post.floorPlan, '_blank')}
                        >
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
                      <button 
                        className="virtual-tour-btn"
                        onClick={() => window.open(post.virtualTour, '_blank')}
                      >
                        🏠 Launch Virtual Tour
                      </button>
                    </div>
                  ) : (
                    <p>Virtual tour not available for this property.</p>
                  )}
                </div>
              )}

              {activeTab === 'mortgage' && (
                <div className="mortgage-tab">
                  <h3>Mortgage Calculator</h3>
                  <div className="mortgage-calculator">
                    <div className="mortgage-inputs">
                      <div className="input-group">
                        <label>Loan Amount ($)</label>
                        <input
                          type="number"
                          value={mortgageData.loanAmount}
                          onChange={(e) => setMortgageData({...mortgageData, loanAmount: parseInt(e.target.value)})}
                        />
                      </div>
                      <div className="input-group">
                        <label>Interest Rate (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={mortgageData.interestRate}
                          onChange={(e) => setMortgageData({...mortgageData, interestRate: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div className="input-group">
                        <label>Loan Term (years)</label>
                        <input
                          type="number"
                          value={mortgageData.loanTerm}
                          onChange={(e) => setMortgageData({...mortgageData, loanTerm: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>
                    <div className="mortgage-results">
                      <div className="result-item">
                        <strong>Monthly Payment:</strong>
                        <span className="payment-amount">
                          ${(() => {
                            const { loanAmount, interestRate, loanTerm } = mortgageData;
                            const monthlyRate = interestRate / 100 / 12;
                            const numPayments = loanTerm * 12;
                            const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                                                  (Math.pow(1 + monthlyRate, numPayments) - 1);
                            return isNaN(monthlyPayment) ? 0 : Math.round(monthlyPayment);
                          })()}
                        </span>
                      </div>
                      <div className="result-item">
                        <strong>Down Payment (20%):</strong>
                        <span>${Math.round(post.price * 0.2)}</span>
                      </div>
                      <div className="result-item">
                        <strong>Property Price:</strong>
                        <span>${post.price}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="history-tab">
                  <h3>Price History</h3>
                  {post.priceHistory && post.priceHistory.length > 0 ? (
                    <div className="price-history">
                      <div className="history-chart">
                        {post.priceHistory.map((entry, index) => (
                          <div key={index} className="history-entry">
                            <div className="history-date">{new Date(entry.date).toLocaleDateString()}</div>
                            <div className="history-price">${entry.price}</div>
                            <div className="history-change">
                              {index > 0 && (
                                <span className={entry.price > post.priceHistory[index - 1].price ? 'increase' : 'decrease'}>
                                  {entry.price > post.priceHistory[index - 1].price ? '↗' : '↘'} 
                                  ${Math.abs(entry.price - post.priceHistory[index - 1].price)}
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
                  <PropertyWeather 
                    latitude={post.latitude} 
                    longitude={post.longitude}
                    property={post}
                  />
                </div>
              )}
            </div>
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
