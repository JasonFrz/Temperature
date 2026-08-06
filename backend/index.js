const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const os = require('os');

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
  let clientIp = req.body.ip || req.ip || 'Unknown-IP';
  if (clientIp.startsWith('::ffff:')) {
    clientIp = clientIp.replace('::ffff:', '');
  }

  const { temperature, humidity, pressure } = req.body;
  const ip = clientIp;

  if (!sensorsData[ip]) {
    sensorsData[ip] = { temperature: 0.0, humidity: 0.0, pressure: 0 };
  }

  if (temperature !== undefined) sensorsData[ip].temperature = temperature;
  if (humidity !== undefined) sensorsData[ip].humidity = humidity;
  if (pressure !== undefined) sensorsData[ip].pressure = pressure;

  console.log(`Received new sensor data for IP [${ip}]:`, sensorsData[ip]);
  
  io.emit('sensor_update', { ip, ...sensorsData[ip] });

  res.status(200).json({ message: 'Data updated successfully', data: { ip, ...sensorsData[ip] } });
});

io.on('connection', (socket) => {
  console.log('A client connected via WebSocket:', socket.id);
  socket.emit('initial_data', sensorsData);
  socket.emit('server_ip', getLocalIps());

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
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

server.listen(PORT, '0.0.0.0', () => {
  const ips = getLocalIps();
  console.log(`Backend API & WebSocket is running on http://localhost:${PORT}`);
  console.log(`\n================================================================`);
  console.log(`>> PILIH SERVER IP UNTUK ESP32 BERDASARKAN JARINGAN ANDA: <<`);
  ips.forEach(ip => {
    console.log(`- [${ip.name}]: http://${ip.address}:${PORT}/api/sensor`);
  });
  console.log(`================================================================\n`);
});
