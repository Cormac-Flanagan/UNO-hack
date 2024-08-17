use core::fmt;
use std::{error::Error, slice::SliceIndex, usize};

// the cards and game logic
use rand::prelude::*;

//
#[derive(Debug, Copy, Clone)]
pub enum Card {
    Regular {
        val: u8,
        color: u8,
    },
    Attack {
        /* Attack Dict
         *0b00 = Skip
         *0b01 = reverse
         *0b10 = plus 2 */
        name: u8,
        color: u8,
    },
    Meta {
        name: u8,
        stored: u8,
    },
    Empty,
}
fn check_color(input: &u8) -> &str {
    match input {
        0b00 => "R",
        0b01 => "B",
        0b10 => "G",
        0b11 => "Y",
        _ => "Error",
    }
}

fn check_name(input: &u8) -> &str {
    match input {
        0b00 => "Skip",
        0b01 => "Reverse",
        0b10 => "+2",
        _ => "Error",
    }
}
fn check_wild(input: &u8) -> &str {
    match input {
        0b00 => "Wild Card",
        0b01 => "+4",
        _ => "Error",
    }
}

impl fmt::Display for Card {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        let card_str: String = match self {
            Self::Regular { val, color } => format!("{} {}", check_color(&color), val),
            Self::Attack { name, color } => {
                format!("{} {}", check_color(&color), check_name(&name))
            }
            Self::Meta { name, stored } => {
                format!("{} (s: {})", check_wild(&name), check_color(&stored))
            }
            _ => "".to_string(),
        };
        write!(f, "{}", card_str)
    }
}

struct Hand {
    hand: Vec<Card>,
}

impl Hand {
    fn new() -> Self {
        Hand {
            hand: vec![Card::Empty],
        }
    }
    fn append(&mut self, add: &mut Vec<Card>) {
        self.hand.append(add);
    }
    pub fn get(&mut self, index: usize) -> Option<&mut Card> {
        self.hand.get_mut(index)
    }
    pub fn remove(&mut self, index: usize) -> Card {
        self.hand.remove(index)
    }
}

impl fmt::Display for Hand {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        let ret = self
            .hand
            .iter()
            .map(|i| format!("{}", i))
            .collect::<Vec<_>>()
            .join(", ");
        return write!(f, "[{}]", ret);
    }
}

fn all_cards() -> Vec<Card> {
    let mut regular: Vec<Card> = (0..40)
        .map(|x| Card::Regular {
            val: x % 10,
            color: x.div_euclid(10),
        })
        .collect();
    let special: Vec<Card> = (0..12)
        .map(|x| Card::Attack {
            name: x % 3,
            color: x.div_euclid(3),
        })
        .collect();
    let meta: Vec<Card> = (0..8)
        .map(|x| Card::Meta {
            name: x >> 1,
            stored: 0,
        })
        .collect();
    regular.extend(special);
    regular.extend(meta);
    return regular;
}

pub struct Game {
    room_code: u32,
    top: Card,
    discard: Vec<Card>,
    deck: Vec<Card>,
    player_count: usize,
    players: Vec<Hand>,
    turn: usize,
    pickup: u8,
    skip_flag: bool,
    reverse_flag: bool,
    rng: rand::rngs::ThreadRng,
}

impl Default for Game {
    fn default() -> Self {
        Game {
            room_code: 0x00,
            deck: all_cards(),
            top: Card::Empty,
            discard: Vec::new(),
            player_count: 4,
            players: vec![Hand::new(), Hand::new(), Hand::new(), Hand::new()],
            turn: 0,
            pickup: 0,
            skip_flag: false,
            reverse_flag: false,
            rng: rand::thread_rng(), //regular rng change on deploy
        }
    }
}
pub enum GameErr {
    UserNotFound,
    CardIndexError,
    CardInvalid,
}
impl GameErr {
    pub fn how(&self) -> String {
        match self {
            Self::UserNotFound => "User Not Found".to_string(),
            Self::CardInvalid => "Wrong Card".to_string(),
            Self::CardIndexError => "Card Selecting Out of Bounds".to_string(),
        }
    }
}

impl Game {
    pub fn new() -> Self {
        Default::default()
    }

    pub fn set(&mut self, code: &u32, num_players: &u8) {
        self.room_code = *code;
        self.player_count = *num_players as usize;
    }

    pub fn debug_game_state(&self) -> String {
        format!("{}", self.top)
    }

    pub fn debug_player_state(&self) -> String {
        self.players
            .iter()
            .enumerate()
            .map(|(i, val)| format!("P{}: {} \n", i, val))
            .collect()
    }

    fn bit_form(card: &Card) -> u8 {
        match card {
            Card::Regular { val, color } => val << 2 | color,
            Card::Attack { name, color } => name << 2 | color,
            Card::Meta { name, .. } => 1 << 5 | name,
            Card::Empty => 0,
        }
    }

    pub fn game_state(&self) -> Vec<u8> {
        let mut state: Vec<u8> = vec![0x02, 0x01];
        for (i, val) in self.players.iter().enumerate() {
            for x in val.hand.iter() {
                state.push(((i as u8) << 6) | Game::bit_form(x))
            }
        }
        return state;
    }
    pub fn init(&mut self) -> () {
        self.deck.shuffle(&mut self.rng);
        for i in 0..self.player_count as usize {
            self.players[i].append(&mut self.deck[0..7].to_vec());
            self.deck.drain(0..7);
        }
        self.top = self.deck.remove(0);
    }

    fn select_card(&mut self, player: usize, index: usize) -> Option<Option<Card>> {
        let p_hand = self.players.get_mut(player);
        match p_hand {
            None => None,
            Some(x) => match x.get(index) {
                Some(card) => Some(Some(*card)),
                _ => Some(None),
            },
        }
    }
    fn drop_card(&mut self, player: usize, index: usize) -> Result<Card, GameErr> {
        let p_hand = self.players.get_mut(player);
        match p_hand {
            None => Err(GameErr::UserNotFound),
            Some(x) => Ok(x.remove(index)),
        }
    }
    pub fn turn(&mut self, p_choice: usize, vol_skip: bool) -> Result<Card, GameErr> {
        if !(self.skip_flag || vol_skip) {
            let player = self.turn % self.player_count;
            let card = self.validate_card(player, p_choice);
            match card {
                Err(a) => Err(a),
                Ok(x) => {
                    self.discard.push(self.top);
                    let val = self.drop_card(player, p_choice);
                    match val {
                        Err(a) => {
                            self.top = x;
                            return Err(a);
                        }
                        Ok(a) => {
                            self.top = a;
                            return Ok(a);
                        }
                    }
                }
            }
        } else {
            Ok(Card::Empty)
        }
    }

    fn validate_card(&mut self, player: usize, player_choice: usize) -> Result<Card, GameErr> {
        let choice = self.select_card(player, player_choice);
        match choice {
            None => Err(GameErr::UserNotFound),
            Some(None) => Err(GameErr::CardIndexError),
            Some(Some(x)) => {
                if self.is_compatible(x) {
                    Ok(x)
                } else {
                    Err(GameErr::CardInvalid)
                }
            }
        }
    }

    fn is_compatible(&mut self, card: Card) -> bool {
        match (self.top, card) {
            (Card::Regular { val: x1, color: y1 }, Card::Regular { val: x2, color: y2 }) => {
                (x1 == x2) || (y1 == y2)
            }
            (Card::Regular { val: _, color: y1 }, Card::Attack { name: _, color: y2 }) => {
                (y1 == y2)
            }
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
            (Card::Attack { name: _, color: y2 }, Card::Regular { val: _, color: y1 }) => {
                (y1 == y2)
            }

            (_, Card::Meta { name: _, stored: _ }) => true,
            (Card::Meta { name: _, stored: c }, Card::Regular { val: _, color: c2 }) => (c == c2),
            (Card::Meta { name: _, stored: c }, Card::Attack { name: _, color: c2 }) => (c == c2),
            _ => false,
        }
    }
}
