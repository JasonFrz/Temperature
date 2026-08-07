const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = process.env.PORT || 5000;
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

app.post('/api/sensor/:id?', (req, res) => {
  const sensorId = req.params.id || req.body.id || req.body.sensorId;

  if (!sensorId) {
    return res.status(400).json({ error: 'Sensor ID is required' });
  }

  const { temperature, humidity, pressure } = req.body;

  if (!sensorsData[sensorId]) {
    sensorsData[sensorId] = { temperature: 0.0, humidity: 0.0, pressure: 0, lastUpdated: Date.now() };
  }

  if (temperature !== undefined) sensorsData[sensorId].temperature = temperature;
  if (humidity !== undefined) sensorsData[sensorId].humidity = humidity;
  if (pressure !== undefined) sensorsData[sensorId].pressure = pressure;
  sensorsData[sensorId].lastUpdated = Date.now();

  io.emit('sensor_update', { [sensorId]: sensorsData[sensorId] });

  console.log(`Received new sensor data for ID [${sensorId}]:`, sensorsData[sensorId]);
  
  res.status(200).json({ message: 'Data updated successfully', data: { id: sensorId, ...sensorsData[sensorId] } });
});

io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);
  socket.emit('initial_data', sensorsData);
  
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const path = require('path');

app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

if (require.main === module) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend API is running on http://localhost:${PORT}`);
  });
}

module.exports = server;
