use futures_util::{StreamExt};
use log::*;
use std::{
    collections::HashMap,
    net::SocketAddr,
    sync::{Arc, Mutex},
};

use serde::{Deserialize, Serialize};
use serde_json::Value;
use tokio::net::{TcpListener, TcpStream};
use tokio_tungstenite::{
    accept_async,
    tungstenite::{Error, Result, protocol::Message},
};

use futures_channel::mpsc::{UnboundedSender, unbounded};

async fn accept_connection(peer: SocketAddr, stream: TcpStream, mut context: Arc<Mutex<Context>>) {
    let matches = &mut context.lock().unwrap().matches;
    let handle = handle_connection(peer, stream, matches).await;
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
type PeerMap = HashMap<SocketAddr, Tx>;

#[derive(Clone)]
struct BammiMatch {
    players: PeerMap,
}

#[derive(Clone)]
struct Context {
    matches: HashMap<String, BammiMatch>,
}

async fn handle_connection(
    peer: SocketAddr,
    stream: TcpStream,
    matches: &mut HashMap<String, BammiMatch>,
) -> Result<()> {
    let mut ws_stream = accept_async(stream).await.expect("Failed to accept");

    info!("New WebSocket connection: {}", peer);

    while let Some(msg) = ws_stream.next().await {
        let msg = msg?;

        //ADD PROPER ERROR HANDLING TO THIS
        if !msg.is_text() && !msg.is_binary() {
            return Ok(());
        }

        let msg_string = msg.into_text().unwrap_or_default();
        let msg_json = serde_json::from_str::<Value>(msg_string.as_str()).unwrap_or_default();
        let message_type: &str = msg_json["message_type"].as_str().unwrap_or_default();
        info!("{:?}", message_type);
        match message_type {
            "connect" => {
                let message_connect: MessageConnect = serde_json::from_value(msg_json).unwrap();
                info!("{:?}", message_connect);

                if matches.get(&message_connect.room_id).is_none() {
                    matches.insert(
                        message_connect.room_id.clone(),
                        BammiMatch {
                            players: PeerMap::new(),
                        },
                    );
                    info!("Starting Match: {}", message_connect.room_id);
                }
                if let Some(&mut bammi_match) = matches.get_mut(&message_connect.room_id) {
                    let (tx, rx) = unbounded();
                    bammi_match.players.insert(peer, tx);
                    for player in bammi_match.players.iter() {
                        info!("player: {:?}", player);
                    }
                }
            }
            "move" => {
                let message_move: MessageMove = serde_json::from_value(msg_json).unwrap();
                info!("{:?}", message_move);
            }
            &_ => {}
        };
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
    let context: Arc<Mutex<Context>> = Arc::new(Mutex::new(Context {
        matches: HashMap::new(),
    }));

    while let Ok((stream, _)) = listener.accept().await {
        let peer = stream
            .peer_addr()
            .expect("connected streams should have a peer address");
        info!("Peer address: {}", peer);

        tokio::spawn(accept_connection(peer, stream, context.clone()));
    }
}
