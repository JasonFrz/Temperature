import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import SensorCard from './components/SensorCard';
import Carousel from './components/Carousel';
import './App.css';

function App() {
  const queryParams = new URLSearchParams(window.location.search);
  const targetIp = queryParams.get('ip');
  const [roomData, setRoomData] = useState({
    ip: targetIp || '192.168.1.50',
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
    const backendUrl = `http://${window.location.hostname}:5000`;
    const socket = io(backendUrl);

    socket.on('connect', () => {
      console.log('Connected to WebSocket Server!');
    });

    socket.on('initial_data', (allSensorsData) => {
      let dataToUse = null;
      let usedIp = roomData.ip;
      
      if (targetIp && allSensorsData[targetIp]) {
        dataToUse = allSensorsData[targetIp];
        usedIp = targetIp;
      } else if (!targetIp) {
        const keys = Object.keys(allSensorsData);
        if (keys.length > 0) {
          usedIp = keys[0];
          dataToUse = allSensorsData[usedIp];
        }
      }

      if (dataToUse) {
        setRoomData(prev => ({
          ...prev,
          ip: usedIp,
          temperature: dataToUse.temperature !== undefined ? dataToUse.temperature : prev.temperature,
          humidity: dataToUse.humidity !== undefined ? dataToUse.humidity : prev.humidity,
          pressure: dataToUse.pressure !== undefined ? dataToUse.pressure : prev.pressure
        }));
      }
    });

    socket.on('server_ip', (ips) => {
      setServerIps(ips);
    });

    socket.on('sensor_update', (data) => {
      const currentTrackedIp = targetIp || roomData.ip;
      if (data.ip !== currentTrackedIp) return;

      if (data.temperature !== undefined || data.pressure !== undefined || data.humidity !== undefined) {
        setRoomData(prev => ({
          ...prev,
          ip: data.ip,
          temperature: data.temperature !== undefined && data.temperature !== 0 ? data.temperature : prev.temperature,
          humidity: data.humidity !== undefined && data.humidity !== 0 ? data.humidity : prev.humidity,
          pressure: data.pressure !== undefined && data.pressure !== 0 ? data.pressure : prev.pressure
        }));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [targetIp, roomData.ip]); 

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

  const getLaptopIp = () => {
    if (serverIps.length === 0) return 'Menunggu...';
    const preferred = serverIps.find(ip => ip.address.startsWith('192.168.'));
    return preferred ? preferred.address : serverIps[0].address;
  };
  const laptopIp = getLaptopIp();

  return (
    <div className="app-container">
      <div className="timestamp-header">
        <span style={{ fontWeight: 800, color: '#facc15', marginRight: '1rem' }}>[{laptopIp}]</span>
        {currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - {currentTime.toLocaleTimeString('id-ID')}
      </div>
      <Carousel items={carouselItems} autoPlayInterval={5000} />
    </div>
  );
}

export default App;
