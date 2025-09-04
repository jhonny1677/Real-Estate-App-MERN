import { useFavorites } from "../../context/FavoritesContext";
import { useNavigate } from "react-router-dom";
import "./comparePage.scss";

function ComparePage() {
  const { compareList, removeFromCompare, clearCompareList } = useFavorites();
  const navigate = useNavigate();

  if (compareList.length === 0) {
    return (
      <div className="compare-page">
        <div className="container">
          <div className="empty-state">
            <div className="empty-icon">⚖️</div>
            <h2>No properties to compare</h2>
            <p>Add properties to compare by clicking the compare icon on property cards!</p>
            <button onClick={() => navigate("/list")} className="browse-btn">
              Browse Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  const exportToPDF = () => {
    window.print();
  };

  const exportToEmail = () => {
    const subject = "Property Comparison Report";
    const body = `Here's my property comparison:\n\n${compareList.map((property, index) => 
      `${index + 1}. ${property.title}\n   Price: $${property.price.toLocaleString()}\n   Address: ${property.address}\n   Bedrooms: ${property.bedroom}, Bathrooms: ${property.bathroom}\n`
    ).join('\n')}`;
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const formatPrice = (price) => {
    return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "N/A";
  };

  return (
    <div className="compare-page">
      <div className="container">
        <div className="header">
          <h1>🔍 Property Comparison</h1>
          <p>Compare up to 3 properties side by side</p>
          <div className="actions">
            <button onClick={exportToPDF} className="export-btn pdf-btn">
              📄 Export PDF
            </button>
            <button onClick={exportToEmail} className="export-btn email-btn">
              📧 Share via Email
            </button>
            <button onClick={clearCompareList} className="clear-btn">
              🗑️ Clear All
            </button>
          </div>
        </div>

        <div className="comparison-container">
          <div className="comparison-table">
            {/* Property Images Row */}
            <div className="comparison-row images-row">
              <div className="row-label">Property</div>
              {compareList.map((property) => (
                <div key={property.id} className="property-cell image-cell">
                  <div className="property-card">
                    <img 
                      src={property.images?.[0] || "/noimage.jpg"} 
                      alt={property.title}
                      className="property-image"
                    />
                    <div className="property-info">
                      <h3>{property.title}</h3>
                      <p className="address">📍 {property.address}</p>
                      <div className="price">${formatPrice(property.price)}</div>
                    </div>
                    <button 
                      className="remove-btn"
                      onClick={() => removeFromCompare(property.id)}
                      title="Remove from comparison"
                    >
                      ❌
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Basic Info Rows */}
            <div className="comparison-row">
              <div className="row-label">Price</div>
              {compareList.map((property) => (
                <div key={property.id} className="property-cell">
                  <span className="value price-value">${formatPrice(property.price)}</span>
                </div>
              ))}
            </div>

            <div className="comparison-row">
              <div className="row-label">Property Type</div>
              {compareList.map((property) => (
                <div key={property.id} className="property-cell">
                  <span className="value">{property.property || property.type || "N/A"}</span>
                </div>
              ))}
            </div>

            <div className="comparison-row">
              <div className="row-label">Bedrooms</div>
              {compareList.map((property) => (
                <div key={property.id} className="property-cell">
                  <span className="value">🛏️ {property.bedroom || "N/A"}</span>
                </div>
              ))}
            </div>

            <div className="comparison-row">
              <div className="row-label">Bathrooms</div>
              {compareList.map((property) => (
                <div key={property.id} className="property-cell">
                  <span className="value">🚿 {property.bathroom || "N/A"}</span>
                </div>
              ))}
            </div>

            <div className="comparison-row">
              <div className="row-label">Size (sq ft)</div>
              {compareList.map((property) => (
                <div key={property.id} className="property-cell">
                  <span className="value">📐 {property.postDetail?.size || property.size || "N/A"}</span>
                </div>
              ))}
            </div>

            {/* Amenities & Features */}
            <div className="comparison-row">
              <div className="row-label">Utilities</div>
              {compareList.map((property) => (
                <div key={property.id} className="property-cell">
                  <span className="value">
                    {property.postDetail?.utilities === "included" ? "✅ Included" : 
                     property.postDetail?.utilities === "tenant" ? "❌ Tenant Pays" : 
                     property.postDetail?.utilities === "shared" ? "🔄 Shared" : "N/A"}
                  </span>
                </div>
              ))}
            </div>

            <div className="comparison-row">
              <div className="row-label">Pet Policy</div>
              {compareList.map((property) => (
                <div key={property.id} className="property-cell">
                  <span className="value">
                    {property.postDetail?.pet === "allowed" ? "🐕 Pets Allowed" :
                     property.postDetail?.pet === "cats" ? "🐱 Cats Only" :
                     property.postDetail?.pet === "dogs" ? "🐕 Dogs Only" :
                     property.postDetail?.pet === "none" ? "❌ No Pets" : "N/A"}
                  </span>
                </div>
              ))}
            </div>

            <div className="comparison-row">
              <div className="row-label">Income Requirement</div>
              {compareList.map((property) => (
                <div key={property.id} className="property-cell">
                  <span className="value">{property.postDetail?.income || "N/A"}</span>
                </div>
              ))}
            </div>

            {/* Location & Nearby */}
            <div className="comparison-row">
              <div className="row-label">Near School</div>
              {compareList.map((property) => (
                <div key={property.id} className="property-cell">
                  <span className="value">
                    🏫 {property.postDetail?.school ? 
                      `${property.postDetail.school > 999 ? 
                        (property.postDetail.school / 1000) + ' km' : 
                        property.postDetail.school + ' m'} away` : "N/A"}
                  </span>
                </div>
              ))}
            </div>

            <div className="comparison-row">
              <div className="row-label">Near Transport</div>
              {compareList.map((property) => (
                <div key={property.id} className="property-cell">
                  <span className="value">
                    🚌 {property.postDetail?.bus ? `${property.postDetail.bus}m away` : "N/A"}
                  </span>
                </div>
              ))}
            </div>

            <div className="comparison-row">
              <div className="row-label">Near Restaurants</div>
              {compareList.map((property) => (
                <div key={property.id} className="property-cell">
                  <span className="value">
                    🍽️ {property.postDetail?.restaurant ? `${property.postDetail.restaurant}m away` : "N/A"}
                  </span>
                </div>
              ))}
            </div>

            {/* Actions Row */}
            <div className="comparison-row actions-row">
              <div className="row-label">Actions</div>
              {compareList.map((property) => (
                <div key={property.id} className="property-cell">
                  <div className="action-buttons">
                    <button 
                      onClick={() => navigate(`/property/${property.id}`)}
                      className="view-btn"
                    >
                      👁️ View Details
                    </button>
                    <button 
                      onClick={() => removeFromCompare(property.id)}
                      className="remove-action-btn"
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="comparison-footer">
          <p>💡 <strong>Tip:</strong> You can add up to 3 properties for comparison. Visit property listings to add more properties.</p>
          <button onClick={() => navigate("/list")} className="add-more-btn">
            ➕ Add More Properties to Compare
          </button>
        </div>
      </div>
    </div>
  );
}

export default ComparePage;