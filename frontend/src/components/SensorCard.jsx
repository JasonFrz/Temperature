import React from 'react';
import './SensorCard.css';

const SensorCard = ({ title, value, unit, colorHint }) => {
  return (
    <div className={`sensor-card ${colorHint}`}>
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
