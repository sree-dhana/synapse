const express = require("express");
const cors = require("cors");
const connectDB = require("./config/dbConnections");
const errorHandler = require("./middleware/errorHandling");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv").config();
const pdfRoutes = require('./routes/pdfRoutes');
const geminiPdfRoutes = require('./routes/geminiPdfRoutes');
const app = express();
const port = process.env.PORT || 5000;
const taskRoutes = require('./routes/taskRoutes');


app.use(express.json());


app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use("/api/mainpage", require("./routes/userRoutes"));
app.use("/api/room", require("./routes/roomRoutes"));
app.use('/api/pdf', pdfRoutes);
app.use('/api', geminiPdfRoutes);
app.use('/api/roadmaps', taskRoutes);

const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET','POST'],
    credentials: true
  }
});

// Make io available in routes/controllers via req.app.get('io')
app.set('io', io);


// Room management - mapping roomId to participants
const rooms = new Map(); // roomId -> Set of {socketId, username}
const activeCalls = new Map(); // roomId -> {type: 'video'|'voice', participants: Set, initiator}
const voiceMessages = new Map(); // roomId -> Array of voice messages

function addUserToRoom(roomId, socketId, username) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
  
  // Remove any existing entries for this user (in case of reconnection)
  const roomParticipants = rooms.get(roomId);
  for (let participant of roomParticipants) {
    if (participant.username === username) {
      roomParticipants.delete(participant);
      break;
    }
  }
  
  // Add the new participant
  roomParticipants.add({ socketId, username });
  console.log(`[ROOM ${roomId}] Added user: ${username} (${socketId})`);
}

function removeUserFromRoom(roomId, socketId) {
  if (!rooms.has(roomId)) return null;
  
  const roomParticipants = rooms.get(roomId);
  let removedUser = null;
  
  for (let participant of roomParticipants) {
    if (participant.socketId === socketId) {
      removedUser = participant;
      roomParticipants.delete(participant);
      break;
    }
  }
  
  // Clean up empty rooms
  if (roomParticipants.size === 0) {
    rooms.delete(roomId);
    console.log(`[ROOM ${roomId}] Room deleted - no participants`);
  }
  
  return removedUser;
}

function broadcastParticipants(roomId, io) {
  if (!rooms.has(roomId)) {
    io.to(roomId).emit('participants', []);
    return;
  }
  
  const participants = Array.from(rooms.get(roomId)).map(p => p.username);
  console.log(`[ROOM ${roomId}] Broadcasting participants:`, participants);
  io.to(roomId).emit('participants', participants);
}


const RoomAnalysis = require('./models/RoomAnalysis');

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join-room", async ({ roomId, username }) => {
    if (!roomId || !username) {
      socket.emit("message", "roomId or username missing");
      return;
    }
    
    console.log(`[JOIN] ${username} joining room ${roomId}`);
    
    // Join the socket room
    socket.join(roomId);
    
    // Add user to our rooms tracking
    addUserToRoom(roomId, socket.id, username);
    
    // Notify others in the room (excluding the joining user)
    socket.to(roomId).emit("message", `${username} joined the room`);
    
    // Broadcast updated participants list to everyone in the room
    broadcastParticipants(roomId, io);

    // Send latest saved analysis for this room to the joining user
    try {
      const latest = await RoomAnalysis.findOne({ roomId });
      if (latest) {
        socket.emit('room-analysis-updated', {
          roomId,
          fileName: latest.fileName,
          analysis: latest.analysis,
          timestamp: latest.updatedAt || latest.lastUpdated || new Date().toISOString()
        });
        console.log(`[ROOM ${roomId}] Sent latest analysis to ${username}`);
      }
    } catch (err) {
      console.error(`[ROOM ${roomId}] Failed to load latest analysis:`, err.message);
    }
  });

  socket.on("chat-message", ({ roomId, message }) => {
    if (!roomId || !message) return;
    
    // Find username from our rooms data
    let username = "Unknown";
    if (rooms.has(roomId)) {
      for (let participant of rooms.get(roomId)) {
        if (participant.socketId === socket.id) {
          username = participant.username;
          break;
        }
      }
    }
    
    const messageData = {
      id: Date.now() + Math.random(), // Unique message ID
      sender: username,
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUser: false // All received messages are treated as "from others"
    };
    
    console.log(`[CHAT] Broadcasting message from ${username}: ${message}`);
    
    // Broadcast to ALL users in the room (including sender)
    io.to(roomId).emit("new-message", messageData);
  });

  // ===== WebRTC Call Signaling =====
  
  socket.on("start-call", ({ roomId, callType }) => {
    if (!roomId || !callType) return;
    
    const roomParticipants = rooms.get(roomId);
    if (!roomParticipants) return;
    
    let initiator = 'Unknown';
    for (let participant of roomParticipants) {
      if (participant.socketId === socket.id) {
        initiator = participant.username;
        break;
      }
    }
    
    // Store active call
    activeCalls.set(roomId, {
      type: callType, // 'video' or 'voice'
      participants: new Set([socket.id]),
      initiator: initiator
    });
    
    // Notify all other users in the room about the call
    socket.to(roomId).emit("call-started", {
      callType,
      initiator,
      roomId
    });
    
    console.log(`[CALL] ${initiator} started ${callType} call in room ${roomId}`);
  });

  socket.on("join-call", ({ roomId }) => {
    if (!roomId) return;
    
    const activeCall = activeCalls.get(roomId);
    if (!activeCall) {
      socket.emit("call-error", "No active call in this room");
      return;
    }
    
    activeCall.participants.add(socket.id);
    
    // Notify all participants about the new joiner
    socket.to(roomId).emit("user-joined-call", { socketId: socket.id });
    
    // Send current call info to the joining user
    socket.emit("call-joined", {
      callType: activeCall.type,
      participants: Array.from(activeCall.participants)
    });
    
    console.log(`[CALL] User ${socket.id} joined call in room ${roomId}`);
  });

  socket.on("leave-call", ({ roomId }) => {
    if (!roomId) return;
    
    const activeCall = activeCalls.get(roomId);
    if (!activeCall) return;
    
    activeCall.participants.delete(socket.id);
    
    // Notify others that user left the call
    socket.to(roomId).emit("user-left-call", { socketId: socket.id });
    
    // If no participants left, end the call
    if (activeCall.participants.size === 0) {
      activeCalls.delete(roomId);
      io.to(roomId).emit("call-ended");
      console.log(`[CALL] Call ended in room ${roomId} - no participants`);
    }
  });

  // WebRTC Signaling
  socket.on("webrtc-offer", ({ roomId, offer, targetSocketId }) => {
    socket.to(targetSocketId).emit("webrtc-offer", {
      offer,
      senderSocketId: socket.id
    });
  });

  socket.on("webrtc-answer", ({ roomId, answer, targetSocketId }) => {
    socket.to(targetSocketId).emit("webrtc-answer", {
      answer,
      senderSocketId: socket.id
    });
  });

  socket.on("webrtc-ice-candidate", ({ roomId, candidate, targetSocketId }) => {
    socket.to(targetSocketId).emit("webrtc-ice-candidate", {
      candidate,
      senderSocketId: socket.id
    });
  });

  // ===== Voice Messages =====
  
  socket.on("voice-message", ({ roomId, audioBlob, duration }) => {
    if (!roomId || !audioBlob) return;
    
    const roomParticipants = rooms.get(roomId);
    if (!roomParticipants) return;
    
    let senderUsername = 'Unknown';
    for (let participant of roomParticipants) {
      if (participant.socketId === socket.id) {
        senderUsername = participant.username;
        break;
      }
    }
    
    // Store voice message temporarily
    if (!voiceMessages.has(roomId)) {
      voiceMessages.set(roomId, []);
    }
    
    const voiceMsg = {
      id: Date.now(),
      sender: senderUsername,
      audioBlob,
      duration,
      timestamp: new Date().toISOString()
    };
    
    voiceMessages.get(roomId).push(voiceMsg);
    
    // Broadcast voice message to everyone in the room
    io.to(roomId).emit("voice-message", voiceMsg);
    
    console.log(`[VOICE] ${senderUsername} sent voice message in room ${roomId}`);
  });

  // ===== Group Task Management =====
  
  socket.on("add-group-task", ({ roomId, task }) => {
    if (!roomId || !task) return;
    
    console.log(`[TASK] Group task added in room ${roomId}:`, task);
    
    // Get current group tasks for this room (in memory for now)
    if (!rooms[roomId]) return;
    if (!rooms[roomId].groupTasks) rooms[roomId].groupTasks = [];
    
    rooms[roomId].groupTasks.push(task);
    
    // Broadcast updated task list to all users in the room
    io.to(roomId).emit("group-tasks-updated", rooms[roomId].groupTasks);
  });

  socket.on("toggle-group-task", ({ roomId, taskId, completed }) => {
    if (!roomId || !taskId || completed === undefined) return;
    
    console.log(`[TASK] Group task toggled in room ${roomId}:`, taskId, completed);
    
    // Update task completion in memory
    if (rooms[roomId] && rooms[roomId].groupTasks) {
      const taskIndex = rooms[roomId].groupTasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        rooms[roomId].groupTasks[taskIndex].completed = completed;
        
        // Broadcast the toggle to all users in the room
        io.to(roomId).emit("task-toggled", { taskId, completed, type: 'group' });
      }
    }
  });

  socket.on("delete-group-task", ({ roomId, taskId }) => {
    if (!roomId || !taskId) return;
    
    console.log(`[TASK] Group task deleted in room ${roomId}:`, taskId);
    
    // Remove task from memory
    if (rooms[roomId] && rooms[roomId].groupTasks) {
      rooms[roomId].groupTasks = rooms[roomId].groupTasks.filter(t => t.id !== taskId);
      
      // Broadcast updated task list to all users in the room
      io.to(roomId).emit("group-tasks-updated", rooms[roomId].groupTasks);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Clean up active calls
    for (let [roomId, call] of activeCalls.entries()) {
      if (call.participants.has(socket.id)) {
        call.participants.delete(socket.id);
        socket.to(roomId).emit("user-left-call", { socketId: socket.id });
        
        if (call.participants.size === 0) {
          activeCalls.delete(roomId);
          io.to(roomId).emit("call-ended");
        }
      }
    }
    
    // Find all rooms this socket was in and remove the user
    for (let [roomId, participants] of rooms.entries()) {
      const removedUser = removeUserFromRoom(roomId, socket.id);
      if (removedUser) {
        console.log(`[LEAVE] ${removedUser.username} left room ${roomId}`);
        
        // Notify others in the room
        socket.to(roomId).emit("message", `${removedUser.username} left the room`);
        
        // Broadcast updated participants list
        broadcastParticipants(roomId, io);
      }
    }
  });
});

connectDB();
app.use(errorHandler);


server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
