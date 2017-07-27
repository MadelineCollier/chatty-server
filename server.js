// chatty_server.js

const express = require('express');
const SocketServer = require('ws').Server;
const uuidv4 = require('uuid/v4');
const PORT = 3001;
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({ server });


//
//
//  message handler function to add ids, and set types for incoming messages
//
//
const handleMessage = (messageString) => {
  const messageObject = JSON.parse(messageString);
  switch (messageObject.type) {
    case 'postMessage':
      messageObject.type = 'incomingMessage';
      break;
    case 'postNotification':
      messageObject.type = 'incomingNotification';
      break;
  }
  messageObject.id = uuidv4();
  return messageObject;
}

//
//
//  sends out data (ie messageObject or clientSize) to all clients
//
//
const broadcast = (data) => {
  const dataString = JSON.stringify(data);
  wss.clients.forEach((client) => {
    client.send(dataString);
  });
}

//
//
//  determines the number of users online
//  and broadcasts that number to all online clients
//
//
const clientUpdate = () => {
  const clientSize = {
    type: 'clientUpdate',
    content: wss.clients.size
  }
  broadcast(clientSize);
}

wss.on('connection', (ws) => {
  console.log('Client connected');
  clientUpdate();

  ws.onmessage = (event) => {
    broadcast(handleMessage(event.data));
  }

  ws.on('close', () => {
    clientUpdate();
    console.log('Client disconnected')
  });
});
