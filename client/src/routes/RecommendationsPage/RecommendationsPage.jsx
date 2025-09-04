import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCurrency } from "../../context/CurrencyContext";
import apiRequest from "../../lib/apiRequest";
import Recommendations from "../../components/recommendations/Recommendations";
import "./recommendationsPage.scss";

function RecommendationsPage() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [currentProperty, setCurrentProperty] = useState(null);
  const [allProperties, setAllProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch the current property
        const propertyRes = await apiRequest.get(`/posts/${propertyId}`);
        setCurrentProperty(propertyRes.data);
        
        // Fetch all properties for recommendations
        const allPropertiesRes = await apiRequest.get("/posts");
        setAllProperties(allPropertiesRes.data || []);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        // Fallback - navigate back if property not found
        navigate("/list");
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchData();
    }
  }, [propertyId, navigate]);

  if (loading) {
    return (
      <div className="recommendations-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Finding similar properties...</p>
        </div>
      </div>
    );
  }

  if (!currentProperty) {
    return (
      <div className="recommendations-page">
        <div className="error-container">
          <h2>Property Not Found</h2>
          <p>We couldn't find the property you're looking for.</p>
          <button onClick={() => navigate("/list")} className="btn-primary">
            Browse All Properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-page">
      {/* Header Section */}
      <div className="page-header">
        <div className="header-content">
          <button onClick={() => navigate(-1)} className="back-button">
            ← Back to Property
          </button>
          
          <div className="property-summary">
            <div className="property-info">
              <h1>Similar Properties</h1>
              <p>Based on: <strong>{currentProperty.title}</strong></p>
              <div className="property-details">
                <span className="detail-item">📍 {currentProperty.address}</span>
                <span className="detail-item">💰 {formatPrice(currentProperty.price)}</span>
                <span className="detail-item">🏠 {currentProperty.bedroom} beds, {currentProperty.bathroom} baths</span>
              </div>
            </div>
            
            {currentProperty.images && currentProperty.images.length > 0 && (
              <div className="property-thumbnail">
                <img src={currentProperty.images[0]} alt={currentProperty.title} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-content">
          <h3>Recommendation Filters</h3>
          <div className="filter-tags">
            <span className="filter-tag active">📍 Same Area</span>
            <span className="filter-tag active">💰 Similar Price Range</span>
            <span className="filter-tag active">🏠 Same Property Type</span>
            <span className="filter-tag active">🛏️ Similar Size</span>
          </div>
          <p className="filter-note">
            We're showing properties within 20% of the price range, same property type, and similar bedroom count in nearby areas.
          </p>
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="recommendations-section">
        <div className="recommendations-content">
          <Recommendations 
            currentProperty={currentProperty} 
            allProperties={allProperties}
            showTitle={false}
            gridLayout={true}
          />
        </div>
      </div>

      {/* Action Section */}
      <div className="action-section">
        <div className="action-content">
          <h3>Didn't Find What You're Looking For?</h3>
          <div className="action-buttons">
            <button 
              onClick={() => navigate("/list")} 
              className="btn-primary"
            >
              Browse All Properties
            </button>
            <button 
              onClick={() => navigate("/contact")} 
              className="btn-secondary"
            >
              Contact an Agent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecommendationsPage;