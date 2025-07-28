const allowRoles=(...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            res.status(403).json({message:"insufficient role access denied"});
        }
        next();
    };
};
module.exports=allowRoles;