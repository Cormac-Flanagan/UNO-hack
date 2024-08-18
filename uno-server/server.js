const net = require('node:net');

function parseCard(u8) {

}
// const client = net.createConnection({ host: '10.89.212.148', port: 8080 }, () => {
const client = net.createConnection({ host: 'macdon.local', port: 8080 }, () => {
  console.log('Client connected');
  //
  intro = new Uint8Array(7);
  intro[0] = 0x0C
  intro[1] = 0xDE
  intro[2] = 0x84
  intro[4] = 0x00
  intro[3] = 0x04
  intro[5] = 0x00
  intro[6] = 0x04
  client.write(intro);
});

function(card_name, card_color) = {
  //update the webpage
}

client.on('data', (data) => {
  console.log('Recieve from server:', data);
});






