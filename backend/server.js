const express = require("express");
const cors = require("cors");
const connectDB = require("./config/dbConnections");
const errorHandler = require("./middleware/errorHandling");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const port = process.env.PORT || 5000;
const app = express();
app.use(express.json());

// HTTP server (must use this for Socket.IO instead of app.listen)
const server = http.createServer(app);

// CORS for REST
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// REST routes
app.use("/api/mainpage", require("./routes/userRoutes"));
app.use("/api/room", require("./routes/roomRoutes"));

// Socket.IO with CORS config
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ["GET", "POST"],
    credentials: true
  }
});

function emitParticipants(roomId) {
  const room = io.sockets.adapter.rooms.get(roomId);
  const participants = room ? Array.from(room) : [];
  io.to(roomId).emit('room-participants', participants);
}

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join-room', (roomId) => {
    if (!roomId) return;
    socket.join(roomId);
    socket.to(roomId).emit('message', `User ${socket.id} joined`);
    emitParticipants(roomId);
  });

  socket.on("chat-message", ({ roomId, message }) => {
    if (!roomId || !message) return;
    io.to(roomId).emit("message", `${socket.id}:${message}`);
  });

  socket.on('disconnecting', () => {
    // After leaving each room, update its participant list
    for (const roomId of socket.rooms) {
      if (roomId !== socket.id) {
        setTimeout(() => emitParticipants(roomId), 0);
      }
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

connectDB();
app.use(errorHandler);

server.listen(port, () => {
  console.log(`HTTP & Socket.IO server running on ${port}`);
});
