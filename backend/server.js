const express = require("express");
const path = require("path");
const cors = require("cors");
const connectDB = require("./config/dbConnections");
const errorHandler = require("./middleware/errorHandling");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv").config();
const pdfRoutes = require('./routes/pdfRoutes');
const geminiPdfRoutes = require('./routes/geminiPdfRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const port = process.env.PORT || 5000;

// ===== CORS Setup =====
// Frontend origins (local + deployed)
const allowedOrigins = [
  "http://localhost:5173",                     // local dev
  "https://synapse-frontend-bq7m.onrender.com" // deployed frontend
];

app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin (like Postman)
    if(!origin) return callback(null, true);

    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// ===== API Routes =====
app.use("/api/mainpage", require("./routes/userRoutes"));
app.use("/api/room", require("./routes/roomRoutes"));
app.use('/api/pdf', pdfRoutes);
app.use('/api', geminiPdfRoutes);
app.use('/api/roadmaps', taskRoutes);

// ===== HTTP + Socket.IO =====
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: function(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET','POST'],
    credentials: true
  }
});

app.set('io', io);

// ===== Room & Call Management =====
// ... (keep your existing addUserToRoom, removeUserFromRoom, broadcastParticipants, io.on("connection") code here) ...

// ===== Optional: Serve Frontend (SPA) in production =====
if (process.env.SERVE_FRONTEND === 'true') {
  const distPath = path.resolve(__dirname, '..', 'synapse-frontend', 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ===== DB & Error Handling =====
connectDB();
app.use(errorHandler);

// ===== Start Server =====
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
