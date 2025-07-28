const asyncHandler=require("express-async-handler");
const bcrypt=require("bcrypt");
const User=require("../models/userModels");
const jwt=require("jsonwebtoken");



const userLogin=asyncHandler(async(req,res)=>{
    const {email,password}=req.body;
     if(!email||!password){
        res.status(400);
        throw new Error("all fields are mandatory");
    }
    const user=await User.findOne({email});
    if(!user){
        res.status(400);
        throw new Error("user not found");
    }
    if(user && (await bcrypt.compare(password,user.password))){
        const accessToken=jwt.sign({
            user:{
                role:user.role,
                email:user.email
            }
            
        },
        (process.env.ACCESS_TOKEN), 
        {expiresIn:'1h'}
        ) ;
        res.status(200).json({accessToken});
    }else{
        res.status(200);
        throw new Error("invalid password or email")
    }
});

const userRegister=asyncHandler(async(req,res)=>{
    const {username,email,password,role}=req.body;
    if(!username||!email||!password||!role){
        res.status(400);
        throw new Error("all fields are mandatory");
    }
    const userExists=await User.findOne({email});
    if(userExists){
        res.status(409);
        throw new Error("user already exists");
    }
    const hasPassword=await bcrypt.hash(password,10);
    const user=await User.create({
        email,
        password:hasPassword,
        username,
        role 
    });
    res.status(200);
    res.json(user);
});
const studentDashboard=asyncHandler(async(req,res)=>{
    res.status(200).json({message:"student dashboard"});
})
const teacherDashboard=asyncHandler(async(req,res)=>{
    res.status(200).json({message:"teacher dashboard"});
})


module.exports={userLogin,userRegister,studentDashboard,teacherDashboard};