const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// Enable CORS for all routes
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      "http://localhost:3000",
      "https://mztools.us.kg"
    ];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST"]
}));

// Socket.io setup with CORS
const io = new Server(server, {
  cors: {
    origin: function(origin, callback) {
      const allowedOrigins = [
        "http://localhost:3000",
        "https://mztools.us.kg"
      ];
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket event handlers
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle joining rooms
  socket.on("join-room", ({ roomId, signal }) => {
    console.log("User", socket.id, "joining room:", roomId);
    socket.join(roomId);
    socket.to(roomId).emit("connect-peer", signal);
  });

  // Handle peer signals
  socket.on("peer-signal", ({ roomId, signal }) => {
    console.log("Peer signal from", socket.id, "in room:", roomId);
    socket.to(roomId).emit("peer-signal", signal);
  });

  // Handle chat messages
  socket.on("send-message", ({ roomId, message }) => {
    console.log("Message from", socket.id, "in room:", roomId);
    socket.to(roomId).emit("receive-message", message);
  });

  // Handle screen sharing signals
  socket.on("screen-share", ({ roomId, stream }) => {
    console.log("Screen share from", socket.id, "in room:", roomId);
    socket.to(roomId).emit("receive-screen-share", stream);
  });

  // Handle disconnections
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    io.emit("user-disconnected", socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Server is running');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});