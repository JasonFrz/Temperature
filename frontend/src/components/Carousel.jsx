import React, { useState, useEffect } from 'react';
import './Carousel.css';

const Carousel = ({ items, autoPlayInterval = 3000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [items.length, autoPlayInterval]);

  return (
    <div className="carousel-container">
      <div 
        className="carousel-track" 
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {items.map((item, index) => (
          <div className="carousel-slide" key={index}>
            {item}
          </div>
        ))}
      </div>
      <div className="carousel-indicators">
        {items.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
