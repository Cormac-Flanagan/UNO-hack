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
});
