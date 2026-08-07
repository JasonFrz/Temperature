import React, { useState, useEffect } from 'react';
import SensorCard from './components/SensorCard';
import Carousel from './components/Carousel';
import ControlRoom from './components/ControlRoom';
import Clock from './components/Clock';
import { io } from 'socket.io-client';
import './App.css';

function App() {
  const queryParams = new URLSearchParams(window.location.search);
  const targetId = queryParams.get('id');
  const [activeId, setActiveId] = useState(targetId || 'iriv-1');
  const [allData, setAllData] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isControlRoom, setIsControlRoom] = useState(
    window.location.pathname === '/control-room' || (window.location.pathname === '/' && !targetId) || window.location.search === '?id=all' || targetId === 'all'
  );

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || (window.location.port === '5173' ? 'http://localhost:5000' : '');
    const socket = io(backendUrl);

    socket.on('initial_data', (data) => {
      setAllData(data);
    });

    socket.on('sensor_update', (newData) => {
      setAllData(prev => ({ ...prev, ...newData }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (targetId) {
      setActiveId(targetId);
    } else {
      const keys = Object.keys(allData);
      if (keys.length > 0 && !allData[activeId]) {
        setActiveId(keys[0]);
      }
    }
  }, [allData, targetId, activeId]);

  const currentSensor = allData[activeId] || {};
  const isStale = currentSensor.lastUpdated ? (Date.now() - currentSensor.lastUpdated > 15000) : false;
  
  const roomData = {
    id: activeId,
    temperature: !isStale && currentSensor.temperature !== undefined ? currentSensor.temperature : 0,
    humidity: !isStale && currentSensor.humidity !== undefined ? currentSensor.humidity : 0,
    pressure: !isStale && currentSensor.pressure !== undefined ? currentSensor.pressure : 0,
  };

  const carouselItems = [
    (
      <div className="fullscreen-slide">
        <div className="cards-container">
          <SensorCard 
            title="Temperature" 
            value={roomData.temperature} 
            unit="°C" 
            colorHint="temp-card"
          />
        </div>
      </div>
    ),
    (
      <div className="fullscreen-slide">
        <div className="cards-container">
          <SensorCard 
            title="Humidity" 
            value={roomData.humidity} 
            unit="%" 
            colorHint="hum-card"
          />
        </div>
      </div>
    ),
    (
      <div className="fullscreen-slide">
        <div className="cards-container">
          <SensorCard 
            title="Pressure" 
            value={roomData.pressure} 
            unit="Pa" 
            colorHint="press-card"
          />
        </div>
      </div>
    )
  ];

  if (isControlRoom) {
    return (
      <div className="app-container">
        <ControlRoom 
          allData={allData} 
          onSelectId={(id) => {
            window.location.href = `/?id=${id}`;
          }}
        />
      </div>
    );
  }

  return (
    <div className="app-container">
      <button className="fullscreen-btn" onClick={toggleFullScreen} aria-label="Toggle Fullscreen">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
        </svg>
      </button>
      <button 
        className="mode-toggle-btn control-room-toggle" 
        onClick={() => {
          setIsControlRoom(true);
          window.history.pushState({}, '', '/');
        }}
      >
        Control Room
      </button>
      <div className="timestamp-header">
        <span style={{ fontWeight: 800, color: '#facc15', marginRight: '1rem' }}>{(roomData.id || 'MENUNGGU DATA...').toUpperCase()}</span>
        <Clock />
      </div>
      {isMobile ? (
        <div className="mobile-cards-stack">
          <SensorCard title="Temperature" value={roomData.temperature} unit="°C" colorHint="temp-card" variant="single-view" />
          <SensorCard title="Humidity" value={roomData.humidity} unit="%" colorHint="hum-card" variant="single-view" />
          <SensorCard title="Pressure" value={roomData.pressure} unit="Pa" colorHint="press-card" variant="single-view" />
        </div>
      ) : (
        <Carousel items={carouselItems} autoPlayInterval={5000} />
      )}
    </div>
  );
}

export default App;
