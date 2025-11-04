const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

let waitingQueue = [];

io.on('connection', socket => {
  socket.on('startChat', () => {
    if (waitingQueue.length > 0) {
      const partnerId = waitingQueue.shift();
      const room = `${socket.id}-${partnerId}`;
      socket.join(room);
      io.sockets.sockets.get(partnerId).join(room);
      io.to(room).emit('chatStarted', { room });
    } else {
      waitingQueue.push(socket.id);
    }
  });

  socket.on('message', ({ room, msg }) => {
    socket.to(room).emit('message', msg);
  });

  socket.on('disconnect', () => {
    waitingQueue = waitingQueue.filter(id => id !== socket.id);
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
