import React, { useState, useEffect } from 'react';
import SensorCard from './components/SensorCard';
import Carousel from './components/Carousel';
import './App.css';

function App() {
  const queryParams = new URLSearchParams(window.location.search);
  const targetId = queryParams.get('id');
  const [roomData, setRoomData] = useState({
    id: targetId || 'iriv-1',
    temperature: 24.5,
    humidity: 50.0,
    pressure: 1013
  });
  const [serverIps, setServerIps] = useState([]);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : '');
    
    const fetchSensorData = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/sensor`);
        if (!response.ok) return;
        const allSensorsData = await response.json();
        
        let dataToUse = null;
        let usedId = roomData.id;
        
        if (targetId && allSensorsData[targetId]) {
          dataToUse = allSensorsData[targetId];
          usedId = targetId;
        } else if (!targetId) {
          const keys = Object.keys(allSensorsData);
          if (keys.length > 0) {
            // Keep current ID if it exists in data, otherwise pick first
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
          setRoomData(prev => ({
            ...prev,
            id: usedId,
            temperature: dataToUse.temperature !== undefined && dataToUse.temperature !== 0 ? dataToUse.temperature : prev.temperature,
            humidity: dataToUse.humidity !== undefined && dataToUse.humidity !== 0 ? dataToUse.humidity : prev.humidity,
            pressure: dataToUse.pressure !== undefined && dataToUse.pressure !== 0 ? dataToUse.pressure : prev.pressure
          }));
        }
      } catch (error) {
        console.error("Failed to fetch sensor data:", error);
      }
    };

    fetchSensorData();
    const intervalId = setInterval(fetchSensorData, 5000);

    return () => clearInterval(intervalId);
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

  return (
    <div className="app-container">
      <div className="timestamp-header">
        <span style={{ fontWeight: 800, color: '#facc15', marginRight: '1rem' }}>[{roomData.id}]</span>
        {currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - {currentTime.toLocaleTimeString('id-ID')}
      </div>
      <Carousel items={carouselItems} autoPlayInterval={5000} />
    </div>
  );
}

export default App;
