const express = require('express');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/users - list all users (id, name, email, role only)
// Used by admins to pick members for a project or assignees for a task
router.get('/', requireAuth, async (req, res) => {
  try {
    const users = await User.find().select('name email role');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
