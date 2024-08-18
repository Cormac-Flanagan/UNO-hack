const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const net = require('net');
const client = new net.createConnection( { port: 8080, host: 'localhost' }, () => {
    console.log('Connected to server');
});
const port = 3002

app.use((req, res, next) => {
    console.log('Request received: ' + req.url);
    next() 
});

app.get('/room/:roomCode', (req, res) => {
    const roomCode = req.params.roomCode;
    res.sendFile(__dirname + '/public/tic-tac-toe.html');
});

app.use(express.static('public'));

const lobbies = {};
const games = {};
players = 0;

io.on('connection', (socket) => {
    console.log('A player connected: ' + socket.id);

    // Handle player joining the game
    socket.on('joinGame', (playerData) => {
        players += 1;
        const { name, roomCode } = playerData;
        socket.join(roomCode);
        
        if (!lobbies[roomCode]) {
            lobbies[roomCode] = { roomCode: roomCode, players: [], spectators: [] };
        }

        const room = lobbies[roomCode];
        // Limit game to 2 active players, others are spectators
        if (room.players.length < 2) {
            room.players.push({ id: socket.id, name: name });
            console.log(`${name} joined room as player: ${roomCode}`);
        } else {
            room.spectators.push({ id: socket.id, name: name });
            console.log(`${name} joined room as spectator: ${roomCode}`);
        }

        io.to(roomCode).emit('playerJoined', playerData);

        // Update lobby state for everyone in the room
        io.to(roomCode).emit('updateLobbyState', lobbies[roomCode]);
    });

    // Handle the start of the game when a player clicks the button
    socket.on('startGame', (data) => {
        const { roomCode } = data;

        const msg = new Uint8Array([0x0C, 0xDE, roomCode>>24|0xFF, roomCode>>16|0xF, roomCode>>8|0xF, roomCode>>24|0xF, players]);
        client.write(msg);

        // Notify all players in the room to redirect to the Tic-Tac-Toe page
        io.to(roomCode).emit('redirectToGame');
        console.log(`Game started in room: ${roomCode}`);
    });
    socket.on('makeMove', (data) => {
        const { roomCode, index } = data;
        
        // Notify all players in the room to redirect to the Tic-Tac-Toe page
        io.to(roomCode).emit('redirectToGame');
        console.log(`Game started in room: ${roomCode}`);
    });
    socket.on('update', (data) => {
        const { roomCode, index } = data;
        
        // Notify all players in the room to redirect to the Tic-Tac-Toe page
        console.log(`Game started in room: ${index}`);
    });

    socket.on('playerMove', (moveData) => {
        const { roomCode, index, symbol } = moveData;
        const game = games[roomCode];

        // If it's the player's turn and the cell is empty, update the board
        if (game.isTurn && game.board[index] === '') {
            game.board[index] = symbol;
            game.isTurn = !game.isTurn;

            // Broadcast the updated game state to both players and spectators
            io.to(roomCode).emit('updateGame', game);
        }
    });

    socket.on('disconnect', () => {
        console.log('Player disconnected: ' + socket.id);

        // Remove the player from the lobby they were in
        for (let roomCode in lobbies) {
            let room = lobbies[roomCode];
            room.players = room.players.filter(player => player.id !== socket.id);
            room.spectators = room.spectators.filter(spectator => spectator.id !== socket.id);
            io.to(roomCode).emit('updateLobbyState', room);

            // If the room is empty, delete it
            if (room.players.length === 0 && room.spectators.length === 0) {
                delete lobbies[roomCode];
            }
        }
    });
});

server.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
