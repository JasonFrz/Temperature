import React, { useState, useEffect } from 'react';
import './Carousel.css';

const Carousel = ({ items, autoPlayInterval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const totalItems = items.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [autoPlayInterval]);

  useEffect(() => {
    if (currentIndex === totalItems) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false); 
        setCurrentIndex(0); 
      }, 1200); 
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, totalItems]);

  const carouselItems = [...items, items[0]];

  return (
    <div className="carousel-container">
      <div 
        className="carousel-track" 
        style={{ 
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: isTransitioning ? 'transform 1.2s ease-in-out' : 'none'
        }}
      >
        {carouselItems.map((item, index) => (
          <div className="carousel-slide" key={index}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
