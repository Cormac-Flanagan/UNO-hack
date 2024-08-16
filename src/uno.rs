// the cards and game logic

// Attack Dict
// 0x00 = Skip
// 0x01 = reverse
// 0x10 = plus 2
#[derive(Debug)]
enum Card {
    Regular { val: u8, color: u8 },
    Attack { name: u8, color: u8 },
    Meta { name: u8, stored: u8 },
}

fn all_cards() -> Vec<Card>{
    let mut regular: Vec<Card> = (0..40).map(|x| Card::Regular {val: x%10, color: x.div_euclid(10)} ).collect();
    let special: Vec<Card>= (0..12).map(|x| Card::Attack{name: x%3, color: x.div_euclid(3)} ).collect();
    let meta: Vec<Card>= (0..8).map(|x| Card::Meta{name: x>>1, stored: 0} ).collect();
    regular.extend(special);
    regular.extend(meta);
    return regular
}

struct Stack {
    top: Card,
    discard: Vec<Card>,
    deck: Vec<Card> = [regular, special, meta],
    
}

fn is_compatible(current: Card, card: Card) -> bool {
    match (current, card) {
        (Card::Regular { val: x1, color: y1 }, Card::Regular { val: x2, color: y2 }) => {
            (x1 == x2) || (y1 == y2)
        }
        (Card::Regular { val: _, color: y1 }, Card::Attack { name: _, color: y2 }) => (y1 == y2),
        (
            Card::Attack {
                name: a1,
                color: c1,
            },
            Card::Attack {
                name: a2,
                color: c2,
            },
        ) => {
            if a1 == 0b10 {
                a2 == 0b10
            } else {
                (a1 == a2) || (c1 == c2)
            }
        }
        (Card::Attack { name: _, color: y2 }, Card::Regular { val: _, color: y1 }) => (y1 == y2),
        (Card::Attack { name: _, color: y2 }, Card::Regular { val: _, color: y1 }) => (y1 == y2),
        (_, Card::Meta { name: _, stored: _ }) => true,
        (Card::Meta { name: _, stored: c }, Card::Regular { val: _, color: c2 }) => (c == c2),
        (Card::Meta { name: _, stored: c }, Card::Attack { name: _, color: c2 }) => (c == c2),
        _ => false,
    }
}
