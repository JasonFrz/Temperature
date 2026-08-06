const express = require('express');
const cors = require('cors');
const os = require('os');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let sensorsData = {
};

app.get('/api/sensor', (req, res) => {
  res.json(sensorsData);
});

app.post('/api/sensor/:id?', (req, res) => {
  const sensorId = req.params.id || req.body.id || req.body.sensorId || 'iriv-1';

  const { temperature, humidity, pressure } = req.body;

  if (!sensorsData[sensorId]) {
    sensorsData[sensorId] = { temperature: 0.0, humidity: 0.0, pressure: 0, lastUpdated: Date.now() };
  }

  if (temperature !== undefined) sensorsData[sensorId].temperature = temperature;
  if (humidity !== undefined) sensorsData[sensorId].humidity = humidity;
  if (pressure !== undefined) sensorsData[sensorId].pressure = pressure;
  sensorsData[sensorId].lastUpdated = Date.now();

  console.log(`Received new sensor data for ID [${sensorId}]:`, sensorsData[sensorId]);
  
  res.status(200).json({ message: 'Data updated successfully', data: { id: sensorId, ...sensorsData[sensorId] } });
});


function getLocalIps() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push({ name, address: iface.address });
      }
    }
  }
  return ips;
}

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, '0.0.0.0', () => {
    const ips = getLocalIps();
    console.log(`Backend API is running on http://localhost:${PORT}`);
    console.log(`\n================================================================`);
    console.log(`>> PILIH SERVER IP UNTUK ESP32 BERDASARKAN JARINGAN ANDA: <<`);
    ips.forEach(ip => {
      console.log(`- [${ip.name}]: http://${ip.address}:${PORT}/api/sensor`);
    });
    console.log(`================================================================\n`);
  });
}

module.exports = app;
