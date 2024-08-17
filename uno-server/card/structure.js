// UNO Card Constructor
function createUnoCard(special, color, content) {
    return {
        special: special,      // true for special cards, false for number cards
        color: color,          // red, blue, green, yellow, or wild
        content: content       // Number for number cards (0-9) or effect like "skip", "reverse", "drawTwo", "wild", "wildDrawFour"
    };
}

// Example of creating cards

// Number card
let numberCard = createUnoCard(false, "red", 5);

// Special card (e.g. Skip)
let skipCard = createUnoCard(true, "blue", "skip");

// Special card (e.g. Wild Draw Four)
let wildDrawFourCard = createUnoCard(true, "wild", "wildDrawFour");

// List of created cards
let deck = [
    numberCard,
    skipCard,
    wildDrawFourCard
];

console.log(JSON.stringify(deck, null, 2));
