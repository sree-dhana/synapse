const express = require('express');
const router = express.Router();
const Roadmap = require('../models/Roadmap');
const User = require('../models/userModels');
const validateToken = require('../middleware/validateTokenHandler');

router.post('/:roadmapId/tasks/:taskId/complete', validateToken, async (req, res) => {
  try {
    const { roadmapId, taskId } = req.params;
    const userId = req.user.id;

    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) return res.status(404).json({ error: 'Roadmap not found' });

    let taskFound = null;
    for (const ms of roadmap.roadmap) {
      const t = ms.tasks.find(x => x.task_id === taskId || x.taskId === taskId);
      if (t) { taskFound = t; break; }
    }
    if (!taskFound) return res.status(404).json({ error: 'Task not found' });
    if (taskFound.completed) return res.status(400).json({ error: 'Task already completed' });

    taskFound.completed = true;
    await roadmap.save();

    const points = taskFound.points || Math.max(5, (taskFound.estimated_hours || 1) * 5);
    await User.findByIdAndUpdate(userId, { $inc: { points } });

    return res.json({ ok: true, pointsAwarded: points });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server_error' });
  }
});

module.exports = router;
