const http = require('http');

const BACKEND_URL = 'http://127.0.0.1:8000/api/sensor';
const TOTAL_ROOMS = 8;

function getRandomValue(min, max) {
  return (Math.random() * (max - min) + min).toFixed(1);
}

function sendData(roomId) {
  const data = JSON.stringify({
    temperature: parseFloat(getRandomValue(20, 35)),
    humidity: parseFloat(getRandomValue(40, 80)),
    pressure: parseFloat(getRandomValue(900, 1100))
  });

  const url = new URL(`${BACKEND_URL}/ruang-${roomId}`);
  
  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = http.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => { responseData += chunk; });
    res.on('end', () => {
      console.log(`[ruang-${roomId}] Data sent. Response: ${res.statusCode}`);
    });
  });

  req.on('error', (error) => {
    console.error(`[ruang-${roomId}] Error sending data: ${error.message}`);
  });

  req.write(data);
  req.end();
}

console.log(`Memulai simulasi sensor ESP32 untuk ${TOTAL_ROOMS} ruangan...`);

// Initial send
for (let i = 1; i <= TOTAL_ROOMS; i++) {
  setTimeout(() => sendData(i), i * 200); // stagger initial sends
}

// Set interval for continuous sending every 5 seconds
setInterval(() => {
  for (let i = 1; i <= TOTAL_ROOMS; i++) {
    // slight randomization so they don't all hit exactly at the same millisecond
    setTimeout(() => sendData(i), Math.random() * 2000); 
  }
}, 5000);
