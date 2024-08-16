// the cards and game logic

#[derive(Debug)]
enum Card {
    Regular { val: u8, color: u8 },
    Attack { name: u8, color: u8 },
    Meta { name: u8, stored: u8 },
}

struct Stack {
    top: Card,
    remain: Vec<Card>,
}

fn isCompatible(current: Stack, card: Card) {
    let x = Stack.top
    match (current, card) {
        (Regular(x, _), Regular(x, _)) => Regular(),
    }
}
