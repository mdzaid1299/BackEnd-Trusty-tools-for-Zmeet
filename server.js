const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// Allowed origins for CORS
const allowedOrigins = ["http://localhost:3000", "https://mztools.us.kg/zmeet"];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // Allow multiple origins
    methods: ["GET", "POST"],
  },
});

// CORS middleware for Express
app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
}));

io.on("connection", (socket) => {
  socket.on("join-room", ({ roomId, signal }) => {
    socket.join(roomId);
    socket.to(roomId).emit("connect-peer", signal);
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("user-disconnected", socket.id);
  });
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
