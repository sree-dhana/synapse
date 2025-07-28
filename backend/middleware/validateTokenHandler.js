const jwt=require("jsonwebtoken");
const asyncHandler=require("express-async-handler");
const validateToken=asyncHandler(async(req,res,next)=>{
    let token;
    let authHeader=req.headers.authorization||req.headers.Authorization;
    if(authHeader && authHeader.startsWith("Bearer")){
        token=authHeader.split(" ")[1];
        if(!token){
            res.status(401);
            throw new Error("invalid token");
        }
        jwt.verify(token,process.env.ACCESS_TOKEN,(err,decoded)=>{
            if(err){
                res.status (401);
                throw new Error("user is not authorized");
            }
            req.user=decoded.user;
            next();
        });
    }else{
        res.status(401);
        throw new Error("authorization header missing or invalid");
    }
}
);
module.exports=validateToken;