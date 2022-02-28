const { Router } = require('express');

const router = Router();
const Task = require('../models/task');

const { verifyAccessToken } = require('../utility/auth');

router.get('/', verifyAccessToken, async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.user.userId });
    res.status(200).json({ message: 'Fetched', data: tasks });
  } catch (error) {
    next(error);
  }
});

router.post('/add', verifyAccessToken, async (req, res, next) => {
  try {
    const task = new Task({
      title: req.body.title,
      description: req.body.description,
      userId: req.user.userId,
    });
    await task.save();
    res.status(201).json({ message: 'Created', data: task });
  } catch (error) {
    next(error);
  }
});

router.delete('/delete', verifyAccessToken, async (req, res, next) => {
  try {
    const task = await Task.deleteOne({ _id: req.body.id });
    res.status(200).json({ message: 'Deleted', data: task });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
