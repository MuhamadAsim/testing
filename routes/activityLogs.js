
const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');

// @route   GET api/activity-logs
// @desc    Get all activity logs
// @access  Public
router.get('/', async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate('userId', 'name email')
      .populate('bookId', 'title author')
      .sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/activity-logs/user/:userId
// @desc    Get activity logs for a specific user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const logs = await ActivityLog.find({ userId: req.params.userId })
      .populate('bookId', 'title author')
      .sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/activity-logs
// @desc    Create a new activity log
// @access  Public
router.post('/', async (req, res) => {
  const { userId, action, bookId, details } = req.body;
  
  try {
    const log = new ActivityLog({
      userId,
      action,
      bookId,
      details
    });
    
    await log.save();
    
    const populatedLog = await ActivityLog.findById(log._id)
      .populate('userId', 'name email')
      .populate('bookId', 'title author');
    
    res.json(populatedLog);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
