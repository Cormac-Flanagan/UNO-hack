const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = 3000;

app.use(express.static('public'));

let lobbies = {};

io.on('connection', (socket) => {
    console.log('A player connected: ' + socket.id);

    // Handle player joining the game
    socket.on('joinGame', (playerData) => {
        const { name, roomCode } = playerData;
        socket.join(roomCode);
        
        if (!lobbies[roomCode]) {
            lobbies[roomCode] = { roomCode: roomCode, players: [] };
        }
        
        lobbies[roomCode].players.push({ id: socket.id, name: name });

        console.log(`${name} joined room: ${roomCode}`);
        io.to(roomCode).emit('playerJoined', playerData);
        
        // Update lobby state for the room
        io.to(roomCode).emit('updateLobbyState', lobbies[roomCode]);
    });

    socket.on('disconnect', () => {
        console.log('Player disconnected: ' + socket.id);

        // Remove the player from the lobby they were in
        for (let roomCode in lobbies) {
            lobbies[roomCode].players = lobbies[roomCode].players.filter(player => player.id !== socket.id);
            io.to(roomCode).emit('updateLobbyState', lobbies[roomCode]);

            // If the room is empty, delete it
            if (lobbies[roomCode].players.length === 0) {
                delete lobbies[roomCode];
            }
        }
    });

    // Handle game-specific events (e.g., playerMove) and broadcast them to the room only
    socket.on('playerMove', (moveData) => {
        const { roomCode } = moveData;
        // Validate and update game state here
        io.to(roomCode).emit('updateGameState', moveData);
    });
});

server.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
