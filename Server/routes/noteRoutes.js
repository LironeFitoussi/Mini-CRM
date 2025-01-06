// routes/noteRoutes.js
const express = require('express');
const { 
    getAllNotes, 
    getNoteById, 
    createNote, 
    updateNote, 
    deleteNote,
    setDueDate,
    toggleIsCompleted
} = require('../controllers/noteController');
const { validateCreateNote, validateUpdateNote } = require('../middlewares/noteValidation');

const router = express.Router();

// Get all notes
router.get('/', getAllNotes);

// Get a single note by ID
router.get('/:id', getNoteById);

// Create a new note
router.post('/', validateCreateNote, createNote);

// Update an existing note
router.put('/:id', validateUpdateNote, updateNote);

// Toggle isCompleted
router.patch('/:id/toggleIsCompleted', toggleIsCompleted);

// Set due date
router.patch('/:id/dueDate', setDueDate);

// Delete a note
router.delete('/:id', deleteNote);

module.exports = router;