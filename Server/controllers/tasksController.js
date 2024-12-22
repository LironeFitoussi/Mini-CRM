const Task = require('../models/Task.js');
const mongoose = require('mongoose');

/**
 * @desc    Get all tasks
 * @route   GET /api/tasks
 * @access  Public or Protected
 */
exports.getTasks = async (req, res) => {
    try {
        // Optionally, you can implement pagination, filtering, etc.
        const tasks = await Task.find()
            .populate('user', 'name email') // Populate user details
            .populate('donator', 'name email') // Populate donator details if needed
            .sort({ createdAt: -1 }); // Sort by newest first

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

/**
 * @desc    Get all tasks by user ID
 * @route   GET /api/tasks/user/:id
 * @access  Public or Protected
    */
exports.getTasksByUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid User ID'
            });
        }

        const tasks = await Task.find({ user: userId })
            // .populate('user', 'name email')
            // .populate('donator', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
}

/**
 * @desc    Get single task by ID
 * @route   GET /api/tasks/:id
 * @access  Public or Protected
 */
exports.getTaskById = async (req, res) => {
    try {
        const taskId = req.params.id;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Task ID'
            });
        }

        const task = await Task.findById(taskId)
            .populate('user', 'name email')
            .populate('donator', 'name email');

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Protected (assuming only authenticated users can create tasks)
 */
exports.createTask = async (req, res) => {
    try {
        const { user, title, description, donator, dueDate } = req.body;

        // Basic validation
        if (!user || !title || !description, !dueDate) {
            return res.status(400).json({
                success: false,
                message: 'Please provide user, title, and description'
            });
        }

        // Optionally, validate that user and donator IDs exist in the database

        const newTask = new Task({
            user,
            title,
            description,
            donator, // Optional field
            dueDate
        });

        const savedTask = await newTask.save();

        // Populate the refs before sending response
        await savedTask
        // .populate('user', 'name email').populate('donator', 'name email');

        res.status(201).json({
            success: true,
            data: savedTask
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

/**
 * @desc    Update a task
 * @route   PUT /api/tasks/:id
 * @access  Protected (assuming only authorized users can update tasks)
 */
exports.updateTask = async (req, res) => {
    try {
        const taskId = req.params.id;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Task ID'
            });
        }

        const { title, description, donator } = req.body;

        // Find the task
        let task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Optionally, check if the user is authorized to update the task
        // Example: if (task.user.toString() !== req.user.id) { ... }

        // Update fields
        if (title) task.title = title;
        if (description) task.description = description;
        if (donator !== undefined) task.donator = donator; // Allow nulling the donator

        const updatedTask = await task.save();

        // Populate the refs before sending response
        await updatedTask
        // .populate('user', 'name email').populate('donator', 'name email');

        res.status(200).json({
            success: true,
            data: updatedTask
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 * @access  Protected (assuming only authorized users can delete tasks)
 */
exports.deleteTask = async (req, res) => {
    try {
        const taskId = req.params.id;

        console.log(taskId);
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Task ID'
            });
        }

        const task = await Task.findByIdAndDelete(taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Task removed'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};
