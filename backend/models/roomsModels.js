const { timeStamp } = require("console");
const mongoose=require("mongoose");
const roomSchema=mongoose.Schema({
    roomId:{
        type: String,
        required:[true,"it is needed"],
        unique:true
    },
    hostId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    participants:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    }]
},{timeStamp:true});


module.exports=mongoose.model("room",roomSchema);