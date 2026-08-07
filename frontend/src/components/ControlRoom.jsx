import React from 'react';
import Carousel from './Carousel';
import SensorCard from './SensorCard';
import Clock from './Clock';
import './ControlRoom.css';

function ControlRoom({ allData, onSelectId }) {
  const activeIds = Object.keys(allData).filter(id => {
    const data = allData[id];
    return data && data.lastUpdated && (Date.now() - data.lastUpdated <= 15000);
  });

  const getCarouselItems = (data) => [
    (
      <div className="cr-slide">
        <div className="cr-cards-container">
          <SensorCard title="Temperature" value={data.temperature !== undefined ? data.temperature.toFixed(1) : 0} unit="°C" colorHint="temp-card" variant="control-room" />
        </div>
      </div>
    ),
    (
      <div className="cr-slide">
        <div className="cr-cards-container">
          <SensorCard title="Humidity" value={data.humidity !== undefined ? data.humidity.toFixed(1) : 0} unit="%" colorHint="hum-card" variant="control-room" />
        </div>
      </div>
    ),
    (
      <div className="cr-slide">
        <div className="cr-cards-container">
          <SensorCard title="Pressure" value={data.pressure !== undefined ? data.pressure.toFixed(1) : 0} unit="Pa" colorHint="press-card" variant="control-room" />
        </div>
      </div>
    )
  ];

  return (
    <div className="control-room-container">
      <h1 className="control-room-title">
        CONTROL ROOM - <Clock />
      </h1>
      
      {activeIds.length === 0 ? (
        <div className="empty-state">Belum ada sensor yang aktif.</div>
      ) : (
        <div className="cr-grid">
          {activeIds.map(id => {
            const data = allData[id];
            
            return (
              <div 
                key={id} 
                className="cr-cell"
                onClick={() => onSelectId && onSelectId(id)}
              >
                <div className="cr-cell-header">
                  <span style={{ fontWeight: 800, color: '#facc15' }}>{id.toUpperCase()}</span>
                </div>
                <div className="cr-cell-body">
                  <Carousel items={getCarouselItems(data)} autoPlayInterval={5000} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ControlRoom;
