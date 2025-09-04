import { useState, useRef, useEffect } from 'react';
import './lazyImage.scss';

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = '/placeholder-image.jpg',
  sizes = '(max-width: 768px) 100vw, 50vw',
  loading = 'lazy',
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  const getOptimizedSrc = (originalSrc) => {
    if (!originalSrc || originalSrc === 'undefined' || originalSrc === 'null') {
      return placeholder;
    }
    
    // If it's already optimized or a placeholder, return as is
    if (originalSrc.includes('placeholder') || originalSrc.includes('optimized') || originalSrc.includes('noimage')) {
      return originalSrc;
    }

    // For external URLs (Unsplash, etc.), add optimization parameters
    if (originalSrc.includes('unsplash.com')) {
      return `${originalSrc}&w=800&q=80&fm=webp`;
    }
    
    // For Pexels images
    if (originalSrc.includes('pexels.com')) {
      return originalSrc;
    }
    
    // For other external URLs, return as is
    if (originalSrc.startsWith('http')) {
      return originalSrc;
    }

    // For local images, add optimization parameters
    return originalSrc;
  };

  return (
    <div 
      ref={imgRef}
      className={`lazy-image-container ${className}`}
      {...props}
    >
      {!isLoaded && (
        <div className="lazy-image-placeholder">
          <div className="lazy-image-skeleton"></div>
        </div>
      )}
      
      {(isInView || loading === 'eager') && (
        <img
          src={hasError ? placeholder : getOptimizedSrc(src)}
          alt={alt}
          className={`lazy-image ${isLoaded ? 'loaded' : 'loading'}`}
          onLoad={handleLoad}
          onError={handleError}
          loading={loading}
          sizes={sizes}
          decoding="async"
        />
      )}
    </div>
  );
};

export default LazyImage;