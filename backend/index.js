const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

app.use(cors());
app.use(express.json());

let sensorsData = {
};

app.get('/api/sensor', (req, res) => {
  res.json(sensorsData);
});

app.post('/api/sensor', (req, res) => {
  const { id = 'IRIV-1', temperature, humidity, pressure } = req.body;

  if (!sensorsData[id]) {
    sensorsData[id] = { temperature: 0.0, humidity: 0.0, pressure: 0 };
  }

  if (temperature !== undefined) sensorsData[id].temperature = temperature;
  if (humidity !== undefined) sensorsData[id].humidity = humidity;
  if (pressure !== undefined) sensorsData[id].pressure = pressure;

  console.log(`Received new sensor data for ID [${id}]:`, sensorsData[id]);
  
  io.emit('sensor_update', { id, ...sensorsData[id] });

  res.status(200).json({ message: 'Data updated successfully', data: { id, ...sensorsData[id] } });
});

io.on('connection', (socket) => {
  console.log('A client connected via WebSocket:', socket.id);
  socket.emit('initial_data', sensorsData);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend API & WebSocket is running on http://localhost:${PORT}`);
  console.log(`Send POST requests to http://<YOUR_LAPTOP_IP>:${PORT}/api/sensor from ESP32`);
});
