export function displayUnoCards(cards) {
    const cardContainer = document.getElementById('cardContainer');
    cardContainer.innerHTML = '';  // Clear any existing cards
  
    cards.forEach(card => {
      const cardElement = document.createElement('div');
      cardElement.classList.add('card');
      cardElement.style.backgroundColor = card.color;
  
      // Add corner numbers or special icons
      const topLeftCorner = document.createElement('div');
      topLeftCorner.classList.add('card-corner', 'top-left');
      const bottomRightCorner = document.createElement('div');
      bottomRightCorner.classList.add('card-corner', 'bottom-right');
  
      // Check if the card is special
      if (card.special) {
        const img = document.createElement('img');
        img.src = `images/${card.content}.png`;
        img.classList.add('special-img');
        cardElement.appendChild(img);
      } else {
        topLeftCorner.innerText = card.content;
        bottomRightCorner.innerText = card.content;
  
        const oval = document.createElement('div');
        oval.classList.add('card-oval');
        const centerContent = document.createElement('div');
        centerContent.classList.add('card-center');
        centerContent.innerText = card.content;
        oval.appendChild(centerContent);
        cardElement.appendChild(oval);
      }
  
      cardElement.appendChild(topLeftCorner);
      cardElement.appendChild(bottomRightCorner);
      cardContainer.appendChild(cardElement);
    });
  }
  