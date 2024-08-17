// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = 3000;

// Serve static files (e.g., the game interface)
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A player connected: ' + socket.id);

    // Handle player joining the game
    socket.on('joinGame', (playerData) => {
        console.log(playerData.name + ' joined the game.');
        // Broadcast the new player to others
        io.emit('playerJoined', playerData);
    });

    // Handle moves or actions
    socket.on('playerMove', (moveData) => {
        // Broadcast the move to all clients
        io.emit('updateGameState', moveData);
    });

    socket.on('disconnect', () => {
        console.log('Player disconnected: ' + socket.id);
    });
});

server.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});



// server.js (continued)
let gameState = {
    players: [],
    currentPlayer: 0,
    moves: []
};

io.on('connection', (socket) => {
    socket.on('playerMove', (moveData) => {
        // Validate move, update game state
        gameState.moves.push(moveData);
        gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
        
        // Broadcast the updated game state
        io.emit('updateGameState', gameState);
    });
});
