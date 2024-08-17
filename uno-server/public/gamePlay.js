document.addEventListener('DOMContentLoaded', function() {
    // Function to get query parameters from the URL
    function getQueryParam(param) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    }
  
    // Get room code from URL parameters
    const roomcode = getQueryParam('roomcode');
  
    if (roomcode) {
      // Display the room code
      document.getElementById('roomCodeDisplay').innerText = roomcode;
  
      // Fetch player data from the server
      fetch(`http://localhost:3000/api/room/${roomcode}`)  // Replace with your actual server endpoint
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            // Display username and player information dynamically
            const userList = document.querySelector('.user-list');
            data.players.forEach(player => {
              const userDiv = document.createElement('div');
              userDiv.classList.add('user');
              userDiv.innerHTML = `<div class="username">${player.username}</div><div class="card-count">${player.cardsLeft}</div>`;
              userList.appendChild(userDiv);
            });
  
            // You can also highlight the current player and update the last played card, etc.
          } else {
            console.error('Failed to retrieve room data.');
          }
        })
        .catch(error => {
          console.error('Error fetching room data:', error);
        });
    } else {
      // If no room code, redirect to the index page
      window.location.href = 'index.html';
    }
  });
  