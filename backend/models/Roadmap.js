const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  task_id: String, title: String, description: String,
  estimated_hours: Number, points: Number, completed: {type:Boolean, default:false}
});

const MilestoneSchema = new mongoose.Schema({
  milestone_id: String, title: String, description: String,
  estimated_hours: Number, priority: {type:String, default:'medium'},
  tasks: [TaskSchema]
});

const RoadmapSchema = new mongoose.Schema({
  document: { title: String, source: String, pages: Number, ocrUsed: {type:Boolean, default:false} },
  summary: String,
  learningObjectives: [String],
  roadmap: [MilestoneSchema],
  hints: [String],
  confidence: Number,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  roomId: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Roadmap', RoadmapSchema);
