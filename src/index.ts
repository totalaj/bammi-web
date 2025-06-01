const webSocket = new WebSocket("ws://localhost:3000", "bammi");

webSocket.onopen = (event: Event): void => {
    const msg = {
	message_type: "move",
	move_cell: 3
    };
    webSocket.send(JSON.stringify(msg));
};

webSocket.onmessage = (event: MessageEvent<any>): void => {
    console.log("message: " + event.data);
};
