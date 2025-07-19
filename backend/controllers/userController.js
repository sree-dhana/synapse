const asyncHandler=require("express-async-handler");

const userLogin=asyncHandler(async(req,res)=>{
    console.log("login done");
    res.status(200);
    res.json({message:"login working"});
    
});
const userRegister=asyncHandler(async(req,res)=>{
    console.log("register done");
    res.status(200);
    res.json({message:"register working"});
    
});
module.exports={userLogin,userRegister};