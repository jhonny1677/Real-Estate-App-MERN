import { useState } from 'react';
import './PropertyImage.scss';

const PropertyImage = ({ 
  src, 
  alt = "Property Image", 
  className = "", 
  style = {},
  showPlaceholder = true,
  onClick,
  ...props 
}) => {
  const [imageState, setImageState] = useState('loading');
  const [attempts, setAttempts] = useState(0);
  
  // Fallback images in order of preference
  const fallbackImages = [
    "/noimage.jpg",
    // CSS-based placeholder as final fallback
    null
  ];
  
  const handleImageLoad = () => {
    setImageState('loaded');
  };
  
  const handleImageError = (e) => {
    setAttempts(prev => prev + 1);
    
    // Try next fallback image
    if (attempts < fallbackImages.length - 1) {
      e.target.src = fallbackImages[attempts];
      setImageState('loading');
    } else {
      // All images failed, show CSS placeholder
      setImageState('failed');
    }
  };
  
  const getImageSrc = () => {
    if (!src || src === 'undefined' || src === 'null') {
      return fallbackImages[0]; // Use first fallback immediately
    }
    return src;
  };
  
  if (imageState === 'failed' && showPlaceholder) {
    return (
      <div 
        className={`property-image-placeholder ${className}`} 
        style={{...style, cursor: onClick ? 'pointer' : 'default'}} 
        onClick={onClick}
        {...props}
      >
        <div className="placeholder-content">
          <div className="placeholder-icon">🏠</div>
          <div className="placeholder-text">Property Image</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`property-image-container ${className}`} style={style}>
      {imageState === 'loading' && showPlaceholder && (
        <div className="image-loading-placeholder">
          <div className="loading-spinner"></div>
        </div>
      )}
      <img
        src={getImageSrc()}
        alt={alt}
        className={`property-image ${imageState === 'loaded' ? 'loaded' : 'loading'}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        onClick={onClick}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
        {...props}
      />
    </div>
  );
};

export default PropertyImage;