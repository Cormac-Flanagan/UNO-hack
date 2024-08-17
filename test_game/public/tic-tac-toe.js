const socket = io();

let playerSymbol;
let isTurn = false;

// Join the Tic-Tac-Toe game room
socket.on('startGame', (gameData) => {
    playerSymbol = gameData.symbol;
    isTurn = gameData.isTurn;
    document.getElementById('gameInfo').textContent = isTurn
        ? "Your turn!"
        : "Waiting for opponent...";
});

// When a move is made, update the board
socket.on('updateGameState', (gameState) => {
    gameState.board.forEach((symbol, index) => {
        document.querySelectorAll('[data-cell]')[index].textContent = symbol;
    });
    isTurn = gameState.isTurn;
    document.getElementById('gameInfo').textContent = isTurn
        ? "Your turn!"
        : "Waiting for opponent...";
});

// Handle player clicking on a cell
document.querySelectorAll('[data-cell]').forEach((cell, index) => {
    cell.addEventListener('click', () => {
        if (isTurn && cell.textContent === '') {
            socket.emit('playerMove', { index: index, symbol: playerSymbol });
        }
    });
});
