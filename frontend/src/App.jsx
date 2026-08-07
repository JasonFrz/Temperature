import React, { useState, useEffect } from 'react';
import SensorCard from './components/SensorCard';
import Carousel from './components/Carousel';
import ControlRoom from './components/ControlRoom';
import Clock from './components/Clock';
import './App.css';

function App() {
  const queryParams = new URLSearchParams(window.location.search);
  const targetId = queryParams.get('id');
  const [roomData, setRoomData] = useState({
    id: targetId || 'iriv-1',
    temperature: 0,
    humidity: 0,
    pressure: 0
  });
  const [serverIps, setServerIps] = useState([]);
  const [allData, setAllData] = useState({});
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
    let isMounted = true;
    let timeoutId;
    const backendUrl = import.meta.env.VITE_BACKEND_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : '');
    
    const fetchSensorData = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/sensor`);
        if (!response.ok) return;
        const allSensorsData = await response.json();
        
        setAllData(allSensorsData);
        
        let dataToUse = null;
        let usedId = roomData.id;
        
        if (targetId && allSensorsData[targetId]) {
          dataToUse = allSensorsData[targetId];
          usedId = targetId;
        } else if (!targetId) {
          const keys = Object.keys(allSensorsData);
          if (keys.length > 0) {
            if (allSensorsData[roomData.id]) {
              usedId = roomData.id;
              dataToUse = allSensorsData[usedId];
            } else {
              usedId = keys[0];
              dataToUse = allSensorsData[usedId];
            }
          }
        }

        if (dataToUse) {
          const isStale = dataToUse.lastUpdated ? (Date.now() - dataToUse.lastUpdated > 15000) : false;

          if (isStale) {
            setRoomData(prev => ({ ...prev, id: usedId, temperature: 0, humidity: 0, pressure: 0 }));
          } else {
            setRoomData(prev => ({
              ...prev,
              id: usedId,
              temperature: dataToUse.temperature !== undefined && dataToUse.temperature !== 0 ? dataToUse.temperature : prev.temperature,
              humidity: dataToUse.humidity !== undefined && dataToUse.humidity !== 0 ? dataToUse.humidity : prev.humidity,
              pressure: dataToUse.pressure !== undefined && dataToUse.pressure !== 0 ? dataToUse.pressure : prev.pressure
            }));
          }
        } else {
          setRoomData(prev => ({ ...prev, id: usedId, temperature: 0, humidity: 0, pressure: 0 }));
        }
      } catch (error) {
        console.error("Failed to fetch sensor data:", error);
      } finally {
        if (isMounted) {
          timeoutId = setTimeout(fetchSensorData, 5000);
        }
      }
    };

    fetchSensorData();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [targetId, roomData.id]); 

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
        <span style={{ fontWeight: 800, color: '#facc15', marginRight: '1rem' }}>{roomData.id.toUpperCase()}</span>
        <Clock />
      </div>
      <Carousel items={carouselItems} autoPlayInterval={5000} />
    </div>
  );
}

export default App;
