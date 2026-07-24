import React, { useState, useEffect } from 'react';
import SensorCard from './components/SensorCard';
import './App.css';

function App() {
  // Mock data for a single room
  const [roomData, setRoomData] = useState({
    temperature: 24.5,
    pressure: 1013
  });

  // Simulate real-time updates for demonstration
  useEffect(() => {
    const interval = setInterval(() => {
      setRoomData(prev => ({
        temperature: +(prev.temperature + (Math.random() * 0.8 - 0.4)).toFixed(1),
        pressure: Math.round(prev.pressure + (Math.random() * 4 - 2))
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      <div className="fullscreen-slide">
        <h1 className="node-title">SUHU RUANGAN</h1>
        <div className="cards-container">
          <SensorCard 
            title="Temperature" 
            value={roomData.temperature} 
            unit="°C" 
          />
          <SensorCard 
            title="Pressure" 
            value={roomData.pressure} 
            unit="hPa" 
          />
        </div>
      </div>
    </div>
  );
}

export default App;
