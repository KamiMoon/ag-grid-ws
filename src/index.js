const WebSocket = require("ws");
const WebSocketServer = WebSocket.WebSocketServer;

const { getGlobalRowData, getDataSubscription } = require("./ServerData");

const port = 8080;

console.log(`Running server on port ${port}`);

function heartbeat() {
  this.isAlive = true;
}

const wss = new WebSocketServer({ port });

wss.on("connection", function connection(ws) {
  console.log("recieved a connection");

  ws.on("message", function message(data) {
    console.log("received: %s", data);
  });

  ws.send(JSON.stringify({ type: "ALL_DATA", data: getGlobalRowData() }));

  ws.on("close", function close() {
    console.log("disconnected");
  });

  ws.isAlive = true;
  ws.on("pong", heartbeat);
});

const observable = getDataSubscription();
const subscription = observable.subscribe((newItem) => {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: "UPDATE", data: newItem }));
    }
  });
});

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on("close", function close() {
  clearInterval(interval);
  subscription.unsubscribe();
});
