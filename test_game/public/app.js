document.getElementById('joinForm').addEventListener('submit', function(event) {
    event.preventDefault();
    joinGame();
});

const socket = io();

function joinGame() {
    const playerName = document.getElementById('playerName').value;
    const roomCode = document.getElementById('roomCode').value;
    socket.emit('joinGame', { name: playerName, roomCode: roomCode });
}

socket.on('playerJoined', (playerData) => {
    document.getElementById('game').style.display = 'none';
    document.getElementById('lobby').style.display = 'block';
    document.getElementById('currentRoom').textContent = playerData.roomCode;
});

socket.on('updateLobbyState', (lobbyData) => {
    const lobbyPlayers = document.getElementById('lobbyPlayers');
    lobbyPlayers.innerHTML = '';
    lobbyData.players.forEach(player => {
        lobbyPlayers.innerHTML += `<p>${player.name}</p>`;
    });

    // Show the "Start Tic-Tac-Toe" button if there are 2 or more players
    const startButton = document.getElementById('startTicTacToe');
    if (lobbyData.players.length >= 2) {
        startButton.style.display = 'block';
    } else {
        startButton.style.display = 'none';
    }
});

// Emit event to server when "Start Tic-Tac-Toe" button is clicked
document.getElementById('startTicTacToe').addEventListener('click', () => {
    const roomCode = document.getElementById('currentRoom').textContent;
    console.log(`Starting game in room: ${roomCode}`); // Debugging log
    socket.emit('startGame', { roomCode: roomCode });
});

// Listen for the event to redirect to Tic-Tac-Toe game page from server
socket.on('redirectToGame', () => {
    window.location.href = 'tic-tac-toe.html';
});
