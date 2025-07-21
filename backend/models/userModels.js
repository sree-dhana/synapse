const mongoose=require("mongoose");
const userSchema=mongoose.Schema(
    {
        username:{
            required:[true,"username is required"],
            type:String
        },
        email:{
            type:String,
            required:[true,"email is required"],
            unique:[true,"email already taken"]
        },
        password:{
            type:String,
            required:[true,"password is required"]
        },
        role:{
            type:String,
            enum:["student","teacher"],
            default:"student",
            required:[true,"specify role"]
        }
    }
)
module.exports=mongoose.model("user",userSchema);