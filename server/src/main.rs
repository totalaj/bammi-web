use futures_util::{SinkExt, StreamExt};
use log::*;
use std::net::SocketAddr;
use tokio::net::{TcpListener, TcpStream};
use tokio_tungstenite::{
    accept_async,
    tungstenite::{Error, Result},
};
use serde::{Deserialize, Serialize};
use serde_json::Value;

async fn accept_connection(peer: SocketAddr, stream: TcpStream) {
    if let Err(e) = handle_connection(peer, stream).await {
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

async fn handle_connection(peer: SocketAddr, stream: TcpStream) -> Result<()> {
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
			"move" => {
			    let message_move: MessageMove = serde_json::from_value(message).unwrap();
			    info!("{:?}", message_move);
			},
			&_ => {
			}
		    }
		}
	    }
        }
    }

    Ok(())
}

#[tokio::main]
async fn main() {
    env_logger::init();

    let addr = "127.0.0.1:3000";
    let listener = TcpListener::bind(&addr).await.expect("Can't listen");
    info!("Listening on: {}", addr);

    while let Ok((stream, _)) = listener.accept().await {
        let peer = stream.peer_addr().expect("connected streams should have a peer address");
        info!("Peer address: {}", peer);

        tokio::spawn(accept_connection(peer, stream));
    }
}
