import { useState } from "react";
import { useRecommendations } from "../../context/RecommendationsContext";
import "./priceAlert.scss";

function PriceAlert({ property }) {
  const { addPriceAlert, priceAlerts, removePriceAlert } = useRecommendations();
  const [isOpen, setIsOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState(Math.floor(property.price * 0.9)); // Default to 10% discount

  const existingAlert = priceAlerts.find(alert => 
    alert.propertyId === property.id && alert.isActive
  );

  const handleCreateAlert = () => {
    if (targetPrice && targetPrice > 0 && targetPrice < property.price) {
      addPriceAlert(property, targetPrice);
      setIsOpen(false);
    }
  };

  const handleRemoveAlert = () => {
    if (existingAlert) {
      removePriceAlert(existingAlert.id);
    }
  };

  const formatPrice = (price) => {
    return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const calculateSavings = () => {
    return property.price - targetPrice;
  };

  const calculateDiscountPercentage = () => {
    return ((calculateSavings() / property.price) * 100).toFixed(1);
  };

  if (existingAlert) {
    return (
      <div className="price-alert-container active">
        <div className="alert-status">
          <span className="alert-icon">🔔</span>
          <div className="alert-info">
            <div className="alert-title">Price Alert Active</div>
            <div className="alert-details">
              You'll be notified when price drops to <strong>${formatPrice(existingAlert.targetPrice)}</strong>
            </div>
          </div>
          <button 
            className="remove-alert-btn"
            onClick={handleRemoveAlert}
            title="Remove price alert"
          >
            ❌
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="price-alert-container">
      {!isOpen ? (
        <button 
          className="create-alert-btn"
          onClick={() => setIsOpen(true)}
        >
          🔔 Set Price Alert
        </button>
      ) : (
        <div className="alert-form">
          <div className="form-header">
            <h4>Set Price Alert</h4>
            <button 
              className="close-btn"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>
          
          <div className="current-price">
            Current Price: <strong>${formatPrice(property.price)}</strong>
          </div>

          <div className="price-input-group">
            <label htmlFor="targetPrice">Notify me when price drops to:</label>
            <div className="price-input">
              <span className="currency">$</span>
              <input
                type="number"
                id="targetPrice"
                value={targetPrice}
                onChange={(e) => setTargetPrice(parseInt(e.target.value) || 0)}
                min="1"
                max={property.price - 1}
                step="1000"
              />
            </div>
          </div>

          {targetPrice > 0 && targetPrice < property.price && (
            <div className="savings-info">
              <div className="savings-amount">
                💰 Potential savings: <strong>${formatPrice(calculateSavings())}</strong>
              </div>
              <div className="discount-percentage">
                ({calculateDiscountPercentage()}% discount)
              </div>
            </div>
          )}

          <div className="form-actions">
            <button 
              className="cancel-btn"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>
            <button 
              className="create-btn"
              onClick={handleCreateAlert}
              disabled={!targetPrice || targetPrice <= 0 || targetPrice >= property.price}
            >
              Create Alert
            </button>
          </div>

          <div className="alert-info-text">
            <small>
              📧 You'll receive a notification when the price drops to your target amount or below.
            </small>
          </div>
        </div>
      )}
    </div>
  );
}

export default PriceAlert;