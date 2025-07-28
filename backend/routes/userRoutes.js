const express=require("express");
const router=express.Router();
const {userLogin,userRegister,studentDashboard,teacherDashboard}=require("../controllers/userController");
const validateToken=require("../middleware/validateTokenHandler");
const allowRoles=require("../middleware/roleMiddleware");




router.post("/login",userLogin);
router.post("/register",userRegister);
router.get("/studentDashboard",validateToken,allowRoles("student"),studentDashboard);
router.get("/teacherDashboard",validateToken,allowRoles("teacher"),teacherDashboard);



module.exports=router;
