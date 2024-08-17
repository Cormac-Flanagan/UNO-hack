const net = require('node:net');


const client = net.createConnection({host: '10.89.212.148', port: 8080}, () => {
  console.log('Client connected');
  //
  intro = new Uint8Array(4);
  intro[0] = 0x0C
  intro[1] = 0xDE
  intro[2] = 0x84
  intro[3] = 0x04
  client.write(intro);
});





