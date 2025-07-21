const asyncHandler=require("express-async-handler");
const bcrypt=require("bcrypt");
const User=require("../models/userModels");
const userLogin=asyncHandler(async(req,res)=>{
    console.log("login done");
    res.status(200);
    res.json({message:"login working"});
    
});
const userRegister=asyncHandler(async(req,res)=>{
    req.body={username,email,password,role};
    if(!username||!email||!password||!role){
        res.status(400);
        throw new Error("all fields are mandatory");
    }
    const userExists=User.findOne({email});
    if(userExists){
        res.status(409);
        throw new Error("user already exists");
    }
    const hasPassword=bcrypt.hash(password,10);
    const user=await User.create({
        email,
        password:hasPassword,
        role 
    });
    res.status(200);
    res.json(user);
});
module.exports={userLogin,userRegister};