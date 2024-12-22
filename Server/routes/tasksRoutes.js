const express = require('express');
const router = express.Router();
const taskController = require('../controllers/tasksController.js');

// Middleware for authentication and authorization (if needed)
// const { protect } = require('../middleware/auth');

// @route   GET /api/tasks
// @desc    Get all tasks
// @access  Public or Protected
router.get('/', taskController.getTasks);

// @route   GET /api/tasks/user/:id
// @desc    Get all tasks by user
// @access  Public or Protected
router.get('/user/:id', taskController.getTasksByUser);

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Public or Protected
router.get('/:id', taskController.getTaskById);

// @route   POST /api/tasks
// @desc    Create new task
// @access  Protected
router.post('/', /* protect, */ taskController.createTask);

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Protected
router.put('/:id', /* protect, */ taskController.updateTask);

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Protected
router.delete('/:id', /* protect, */ taskController.deleteTask);

module.exports = router;
