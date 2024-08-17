pub mod uno;
use std::array;
use std::io::prelude::*;
use std::net::{TcpListener, TcpStream};

fn main() {
    let mut rooms: u32 = 0;
    let mut games: uno::Game = uno::Game::new();
    // let listner = TcpListener::bind("10.89.212.148:8080").unwrap();
    let listner = TcpListener::bind("macdon.local:8080").unwrap();
    println!("Success");
    for stream in listner.incoming() {
        match stream {
            Ok(stream) => {
                println!("Found Url");
                handle_connection(stream, &mut rooms, &mut games);
            }
            Err(e) => println!("Failure"),
        }
    }
    println!("{}", games.debug_game_state());
}

fn handle_connection(mut stream: TcpStream, room: &mut u32, game: &mut uno::Game) {
    let mut cmds: [u8; 7] = array::from_fn(|_| 0);
    let _ = stream.read(&mut cmds);
    if cmds.get(6).is_some() {
        println!("{:?}", cmds.get(0..2).unwrap() == [0x0Cu8, 0xDE]);
        if cmds.get(0..2).unwrap() == [0x0Cu8, 0xDE] {
            let room_code: u32 = cmds
                .get(2..5)
                .unwrap()
                .iter()
                .fold(0u32, |acc, x| (acc << 8) | *x as u32);
            let num_players = cmds.get(6).unwrap();
            *room = room_code;
            *game = uno::Game::new();
            uno::Game::set(game, &room_code, num_players);
            let _ = stream.write_all(&game.game_state());
        }
        if cmds.get(0..2).unwrap() == [0x0Cu8, 0x11] {
            let val: usize = *cmds.get(5).unwrap() as usize;
            game_logic(game, val)
        }
    }
}

fn game_logic(game: &mut uno::Game, selected: usize) {
    let error = game.turn(selected, false);
    match error {
        Err(a) => println!("{}", a.how()),
        Ok(_) => println!("Success"),
    }

    println!("{}", game.debug_player_state());
    println!("{}", game.debug_game_state());
}
