pub mod uno;
use std::io;
use std::net::{TcpListener, TcpStream};

fn main() {
    let listner = TcpListener::bind("10.89.212.148:8080").unwrap();

    for stream in listner.incoming() {
        let stream = stream.unwrap();
        println!("Connection Established")
    }

    let mut game = uno::Game::new();
    game.init();
    println!("{}", game.debug_player_state());
    println!("{}", game.debug_game_state());
    let mut input = String::new();
    let _ = io::stdin().read_line(&mut input);
    let error = game.turn(input.trim_end().parse::<usize>().unwrap(), false);
    match error {
        Err(a) => println!("{}", a.how()),
        Ok(_) => println!("Success"),
    }

    println!("{}", game.debug_player_state());
    println!("{}", game.debug_game_state());
}
