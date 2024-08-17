const net = require('node:net');


const client = net.createConnection({host: 'http://macdon', port: 8080}, () => {
  console.log('Client connected');
  client.write('Hello from client');
});





