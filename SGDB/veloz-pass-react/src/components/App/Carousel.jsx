import React, { useState, useEffect, useRef } from 'react';
import './Carousel.css';

const Carousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const trackRef = useRef(null);

  const moveToSlide = (index) => {
    if (trackRef.current && images.length > 0) {
      const slideWidth = trackRef.current.children[0]?.getBoundingClientRect().width || 0;
      trackRef.current.style.transform = `translateX(-${index * slideWidth}px)`;
      setCurrentIndex(index);
    }
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % images.length;
    moveToSlide(nextIndex);
  };

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    moveToSlide(prevIndex);
  };

  useEffect(() => {
    const handleResize = () => {
      moveToSlide(currentIndex);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentIndex, images.length]);

  useEffect(() => {
    moveToSlide(0);
  }, [images]);

  return (
    <div className="carousel-container">
      <button className="carousel-btn prev" onClick={handlePrev} aria-label="Slide anterior">
        <i className="bi bi-chevron-left"></i>
      </button>
      <div className="carousel-track-container">
        <ul className="carousel-track" ref={trackRef}>
          {images.map((src, index) => (
            <li key={index} className="carousel-slide">
              <img src={src} alt={`Interface Veloz Pass ${index + 1}`} loading="lazy" />
            </li>
          ))}
        </ul>
      </div>
      <button className="carousel-btn next" onClick={handleNext} aria-label="Próximo slide">
        <i className="bi bi-chevron-right"></i>
      </button>
    </div>
  );
};
