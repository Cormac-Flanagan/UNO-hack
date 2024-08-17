document.getElementById('playForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const roomcode = document.getElementById('roomcode').value;

  // Validate room code to be exactly 6 digits
  if (!/^\d{6}$/.test(roomcode)) {
    alert("Room code must be exactly 6 digits.");
    return;
  }

  // Send the data to the server
  fetch('http://localhost:3000/api/join', {  // Update with your actual server endpoint
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, roomcode }),
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Redirect to gamePlay.html and include the room code and username in the query parameters
      window.location.href = `gamePlay.html?roomcode=${roomcode}`;
    } else {
      document.getElementById('response').innerText = 'Failed to join room.';
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
});
