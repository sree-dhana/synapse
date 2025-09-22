const mongoose = require('mongoose');

const RoomAnalysisSchema = new mongoose.Schema({
  roomId: { type: String, required: true, index: true, unique: true },
  fileName: { type: String },
  analysis: { type: mongoose.Schema.Types.Mixed, required: true },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('RoomAnalysis', RoomAnalysisSchema);
