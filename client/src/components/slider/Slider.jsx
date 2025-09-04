import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import "./slider.scss";
import PropertyImage from "../PropertyImage/PropertyImage";

function Slider({ images = [] }) {
  const [imageIndex, setImageIndex] = useState(null);
  
  // Ensure we have at least one placeholder image if no images provided
  const safeImages = images && images.length > 0 ? images : [null];

  const handleFullScreen = (index) => {
    setImageIndex(index);
  };

  const changeImage = useCallback((direction) => {
    if (direction === "left") {
      setImageIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
    } else {
      setImageIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
    }
  }, [safeImages.length]);

  // Handle keyboard events for modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (imageIndex !== null) {
        switch (event.key) {
          case 'Escape':
            setImageIndex(null);
            break;
          case 'ArrowLeft':
            changeImage("left");
            break;
          case 'ArrowRight':
            changeImage("right");
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [imageIndex, changeImage]);

  const shouldShowModal = imageIndex !== null && imageIndex !== undefined;
  
  const modalContent = shouldShowModal ? (
    <div 
      className="fullSlider" 
      onClick={(e) => e.target.classList.contains('fullSlider') && setImageIndex(null)}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(4px)',
        zIndex: 999999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        animation: 'fadeIn 0.3s ease'
      }}
    >
      {/* Left Arrow */}
      <div 
        onClick={() => changeImage("left")}
        style={{
          position: 'absolute',
          left: '30px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '50px',
          height: '50px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: '2px solid rgba(255, 255, 255, 0.8)',
          transition: 'all 0.3s ease',
          zIndex: 1000000
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
          e.target.style.transform = 'translateY(-50%) scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
          e.target.style.transform = 'translateY(-50%) scale(1)';
        }}
      >
        <span style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>‹</span>
      </div>

      {/* Right Arrow */}
      <div 
        onClick={() => changeImage("right")}
        style={{
          position: 'absolute',
          right: '30px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '50px',
          height: '50px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: '2px solid rgba(255, 255, 255, 0.8)',
          transition: 'all 0.3s ease',
          zIndex: 1000000
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
          e.target.style.transform = 'translateY(-50%) scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
          e.target.style.transform = 'translateY(-50%) scale(1)';
        }}
      >
        <span style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>›</span>
      </div>

      {/* Modal Content */}
      <div 
        className="imgContainer"
        style={{
          width: '600px',
          height: '400px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <img 
          src={safeImages[imageIndex] || "/noimage.jpg"} 
          alt="Property fullscreen image"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: '8px'
          }}
        />
        
        {/* Close Button */}
        <div 
          onClick={() => setImageIndex(null)} 
          title="Close (ESC)"
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            width: '40px',
            height: '40px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '20px',
            fontWeight: 'bold',
            border: '2px solid rgba(255, 255, 255, 0.9)',
            transition: 'all 0.3s ease',
            zIndex: 1000001
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(220, 38, 38, 0.9)';
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          ✕
        </div>

        {/* Image Counter */}
        <div 
          style={{
            position: 'absolute',
            bottom: '15px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {imageIndex + 1} / {safeImages.length}
        </div>
      </div>
    </div>
  ) : null;


  return (
    <div className="slider">
      {/* Render modal as portal to document body */}
      {modalContent && createPortal(modalContent, document.body)}

      <div className="bigImage">
        <PropertyImage 
          src={safeImages[0]} 
          alt="Property main image" 
          className="main-property-image"
          onClick={() => handleFullScreen(0)}
          showPlaceholder={true}
        />
      </div>

      <div className="smallImages">
        {safeImages.slice(1, 4).map((img, index) => (
          <PropertyImage
            key={index + 1}
            src={img}
            alt={`Property image ${index + 2}`}
            className="thumbnail-image"
            onClick={() => handleFullScreen(index + 1)}
            showPlaceholder={true}
          />
        ))}
      </div>
    </div>
  );
}

export default Slider;
