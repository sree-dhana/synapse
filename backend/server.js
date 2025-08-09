const express=require("express");
const cors=require("cors");
const connectDB = require("./config/dbConnections");
const errorHandler = require("./middleware/errorHandling");
const app=express();
const http=require("http");
const {Server}=require("socket.io");
const { disconnect } = require("process");
const dotenv=require("dotenv").config();
const port=process.env.PORT||5000



app.use(express.json());
const server=http.createServer(app);
const io=new Server(server);

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use("/api/mainpage",require("./routes/userRoutes"));
app.use("/api/room",require("./routes/roomRoutes"));
io.on("connection",(socket)=>{
  console.log(`User connected :${socket.id}`);
  socket.join("join-room",(roomId)=>{
    socket.join(roomId);
    socket.to(roomId).emit("message",`User ${socket.io} joined`)
  });
  socket.on("chat-message",({roomId,message})=>{
    io.to(roomId).emit("message",`${socket.id}:${message}`);
  });
  socket.on("disconnect",()=>{
    console.log(`User disconnected:${socket.id}`);
  })
})

connectDB();
app.use(errorHandler);

app.listen(port,()=>{
    console.log(`server is running ${port}`);
})
