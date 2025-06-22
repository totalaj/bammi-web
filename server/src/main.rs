use futures_util::{SinkExt, StreamExt};
use log::*;
use std::{
    net::SocketAddr,
    collections::HashMap,
    sync::{Arc, Mutex},
};

use tokio::net::{TcpListener, TcpStream};
use tokio_tungstenite::{
    accept_async,
    tungstenite::{Error, Result, protocol::Message},
};
use serde::{Deserialize, Serialize};
use serde_json::Value;

use futures_channel::mpsc::{unbounded, UnboundedSender};

async fn accept_connection(peer: SocketAddr, stream: TcpStream, mut context: Context) {
    if let Err(e) = handle_connection(peer, stream, &mut context).await {
        match e {
            Error::ConnectionClosed | Error::Protocol(_) | Error::Utf8 => (),
            err => error!("Error processing connection: {}", err),
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
struct MessageMove {
    message_type: String,
    area: i32,
    player: i32,
}

#[derive(Serialize, Deserialize, Debug)]
struct MessageConnect {
    message_type: String,
    room_id: String,
    player_id: String,
}

type Tx = UnboundedSender<Message>;
type PeerMap = Arc<Mutex<HashMap<SocketAddr, Tx>>>;

#[derive(Clone)]
struct BammiMatch {
    players: PeerMap,
}

#[derive(Clone)]
struct Context {
    matches: HashMap<String, BammiMatch>,
}

async fn handle_connection(peer: SocketAddr, stream: TcpStream, context: &mut Context) -> Result<()> {
    let mut ws_stream = accept_async(stream).await.expect("Failed to accept");

    info!("New WebSocket connection: {}", peer);

    while let Some(msg) = ws_stream.next().await {
        let msg = msg?;

	//ADD PROPER ERROR HANDLING TO THIS
        if msg.is_text() || msg.is_binary() {
	    if let Ok(msg_string) = msg.into_text() {
		if let Ok(message) = serde_json::from_str::<Value>(msg_string.as_str()) {
		    let message_type: &str = message["message_type"].as_str().unwrap();
		    info!("{:?}", message_type);
		    match message_type {
			"connect" => {
			    let message_connect: MessageConnect = serde_json::from_value(message).unwrap();
			    info!("{:?}", message_connect);

			    if context.matches.get(&message_connect.room_id).is_none() {
				context.matches.insert(message_connect.room_id.clone(), BammiMatch{players: PeerMap::new(Mutex::new(HashMap::new()))});
				info!("Starting Match: {}", message_connect.room_id);
			    }
			    if let Some(bammi_match) = context.matches.get(&message_connect.room_id) {
				let (tx, rx) = unbounded();
				let mut players = bammi_match.players.lock().unwrap();
				players.insert(peer, tx);
				for player in players.iter() {
				    info!("player: {:?}", player);
				}
			    }
			},
			"move" => {
			    let message_move: MessageMove = serde_json::from_value(message).unwrap();
			    info!("{:?}", message_move);
			},
			&_ => {},
		    }
		}
	    }
        }
    }
    info!("Disconnected: {}", peer);

    Ok(())
}

#[tokio::main]
async fn main() {
    env_logger::init();

    let addr = "127.0.0.1:3000";
    let listener = TcpListener::bind(&addr).await.expect("Can't listen");
    info!("Listening on: {}", addr);
    let context = Context {
	matches: HashMap::new(),
    };

    while let Ok((stream, _)) = listener.accept().await {
        let peer = stream.peer_addr().expect("connected streams should have a peer address");
        info!("Peer address: {}", peer);

        tokio::spawn(accept_connection(peer, stream, context.clone())); //not sure how I feel about this clone, need to think about it
	//just as expected, it creates a copy of the context, so we can't access the player list, because it's per player,
	//need to figure out how to do a mutable reference, probably some kind of arc mutex is correct here, because
	//we only need to lock it when we insert data
    }
}
