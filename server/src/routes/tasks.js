const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Helper: check if user is owner or member of a project
async function userHasProjectAccess(projectId, userId) {
  const project = await Project.findById(projectId);
  if (!project) return null;
  const hasAccess =
    project.owner.toString() === userId ||
    project.members.some((m) => m.toString() === userId);
  return hasAccess ? project : false;
}

// GET /api/tasks?projectId=... - list tasks for a project
router.get('/', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      return res.status(400).json({ message: 'projectId query param is required' });
    }

    const access = await userHasProjectAccess(projectId, req.user.id);
    if (!access) return res.status(403).json({ message: 'No access to this project' });

    const tasks = await Task.find({ project: projectId })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/tasks/dashboard - tasks assigned to the logged-in user, grouped by status + overdue flag
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.id })
      .populate('project', 'name')
      .sort({ dueDate: 1 });

    const now = new Date();
    const withOverdueFlag = tasks.map((t) => ({
      ...t.toObject(),
      isOverdue: t.dueDate && t.status !== 'done' && new Date(t.dueDate) < now,
    }));

    res.json(withOverdueFlag);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/tasks - create a task (admin only)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, description, project, assignedTo, dueDate, status } = req.body;

    if (!title || !project) {
      return res.status(400).json({ message: 'Title and project are required' });
    }

    const access = await userHasProjectAccess(project, req.user.id);
    if (!access) return res.status(403).json({ message: 'No access to this project' });

    const task = await Task.create({
      title,
      description: description || '',
      project,
      assignedTo: assignedTo || null,
      dueDate: dueDate || null,
      status: status || 'todo',
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/tasks/:id - update a task
// Admins can edit everything. Members can only update the status of tasks assigned to them.
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role === 'admin') {
      const { title, description, assignedTo, dueDate, status } = req.body;
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (assignedTo !== undefined) task.assignedTo = assignedTo;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (status) task.status = status;
    } else {
      // member: only allowed to update status, and only on their own task
      if (!task.assignedTo || task.assignedTo.toString() !== req.user.id) {
        return res.status(403).json({ message: 'You can only update tasks assigned to you' });
      }
      const { status } = req.body;
      if (!status) return res.status(400).json({ message: 'Status is required' });
      task.status = status;
    }

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/tasks/:id - delete a task (admin only)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
