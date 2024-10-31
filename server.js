const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// Use environment variable or default to localhost
const allowedOrigin = process.env.CLIENT_ORIGIN || "http://localhost:3000";

const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST"],
  },
});

app.use(
  cors({
    origin: allowedOrigin,
  })
);

io.on("connection", (socket) => {
  socket.on("join-room", (signal) => {
    socket.broadcast.emit("connect-peer", signal);
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("user-disconnected", socket.id);
  });
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
