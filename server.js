const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://mztools.us.kg/zmeet", // Update this to your frontend's URL
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: "https://mztools.us.kg/zmeet" }));

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
