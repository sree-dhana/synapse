const express = require("express");
const asyncHandler = require("express-async-handler");
const Room = require("../models/roomsModels");
const { v4: uuidv4 } = require("uuid");

const createRoom = asyncHandler(async (req, res) => {
  const hostId = req.user.id;
  const roomId = uuidv4().slice(0, 6);

  const newRoom = await Room.create({
    roomId,
    hostId,
    participants: [hostId],
  });

  return res.status(201).json({
    message: "Room created successfully",
    roomId: newRoom.roomId,
    participants: newRoom.participants,
  });
});

const joinRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.body;
  const userId = req.user.id;

  const foundRoom = await Room.findOne({ roomId });

  if (!foundRoom) {
    return res.status(404).json({ message: "Room not found" });
  }

  if (!foundRoom.participants.includes(userId)) {
    foundRoom.participants.push(userId);
    await foundRoom.save();
    return res.status(200).json({ message: "Joined room successfully" });
  }

  return res.status(200).json({ message: "Already in the room" });
});

module.exports = { createRoom, joinRoom };
