import React from 'react';
import './SensorCard.css';

const SensorCard = ({ title, value, unit, colorHint, variant = 'single-view' }) => {
  const valStr = String(value);
  const length = valStr.length;
  
  let sizeClass = 'size-large';
  if (length >= 9) {
    sizeClass = 'size-xs';
  } else if (length >= 6) {
    sizeClass = 'size-small';
  } else if (length >= 4) {
    sizeClass = 'size-medium';
  }

  return (
    <div className={`sensor-card ${colorHint} ${sizeClass} variant-${variant}`}>
      <div className="sensor-header">
        <h3 className="sensor-title">{title}</h3>
      </div>
      <div className="sensor-value-container">
        <span className="sensor-value">{value}</span>
        <span className="sensor-unit">{unit}</span>
      </div>
    </div>
  );
};

export default SensorCard;
