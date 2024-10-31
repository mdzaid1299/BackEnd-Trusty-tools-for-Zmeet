const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

io.on('connection', socket => {
  socket.on('join-room', signal => {
    socket.broadcast.emit('connect-peer', signal);
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', socket.id);
  });
});

server.listen(5000, () => {
  console.log('Server is running on port 5000');
});
