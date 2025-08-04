const express=require("express");
const router=express.Router();
const {createRoom,joinRoom}=require("../controllers/roomController");
const validateToken = require("../middleware/validateTokenHandler");


router.post("/createroom",validateToken,createRoom);
router.post("/joinroom",validateToken,joinRoom);

module.exports=router;