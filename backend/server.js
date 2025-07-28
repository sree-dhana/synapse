const express=require("express");
const connectDB = require("./config/dbConnections");
const errorHandler = require("./middleware/errorHandling");
const app=express();
const dotenv=require("dotenv").config();


const port=process.env.PORT||5000



app.use(express.json());
app.use("/api/mainpage",require("./routes/userRoutes"));
connectDB();
app.use(errorHandler);


app.listen(port,()=>{
    console.log(`server is running ${port}`);
})
