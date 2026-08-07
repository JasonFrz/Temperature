const http = require('http');

const BACKEND_URL = 'http://127.0.0.1:5000/api/sensor';
const ID = 'ruang-c';

function getRandomValue(min, max) {
  return (Math.random() * (max - min) + min).toFixed(1);
}

function sendData() {
  const data = JSON.stringify({
    temperature: parseFloat(getRandomValue(20, 35)),
    humidity: parseFloat(getRandomValue(40, 80)),
    pressure: parseFloat(getRandomValue(900, 1100))
  });

  const url = new URL(`${BACKEND_URL}/${ID}`);
  
  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => { responseData += chunk; });
    res.on('end', () => {
      console.log(`[${ID}] Data sent. Response: ${res.statusCode} - ${responseData}`);
    });
  });

  req.on('error', (error) => {
    console.error(`[${ID}] Error sending data: ${error.message}`);
  });

  req.write(data);
  req.end();
}

console.log(`Memulai simulasi sensor ESP32 untuk [${ID}]...`);
sendData();
setInterval(sendData, 5000);
