const express = require('express');
const router = express.Router();
const auth = require('../Middleware/authMiddleware');
const noteController = require('../Controllers/noteController');

// Create a new note (title + description)
router.post('/', auth, noteController.createNote);

// Get all notes for the logged-in user
router.get('/', auth, noteController.getNotes);

// Update a note by ID (only user's own notes)
router.put('/:id', auth, noteController.updateNote);

// Delete a note by ID (only user's own notes)
router.delete('/:id', auth, noteController.deleteNote);

module.exports = router;
