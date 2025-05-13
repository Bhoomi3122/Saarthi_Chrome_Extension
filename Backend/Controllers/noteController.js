const Note = require('../Models/Note');

// Create new note
exports.createNote = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "User is not authenticated" });
        }

        console.log("User from token:", req.user);

        const newNote = new Note({
            user: req.user.id,
            title,
            description
        });

        const savedNote = await newNote.save();
        res.status(201).json(savedNote);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create note" });
    }
};

// Get all notes for user
exports.getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json({ notes });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch notes" });
    }
};

// Update note
exports.updateNote = async (req, res) => {
    try {
        const noteId = req.params.id;
        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({ error: "Title and description are required." });
        }

        const updatedNote = await Note.findOneAndUpdate(
            { _id: noteId, user: req.user.id },
            { title, description },
            { new: true }
        );

        if (!updatedNote) {
            return res.status(404).json({ error: "Note not found or unauthorized" });
        }

        res.json({ success: true, message: "Note updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update note" });
    }
};

// Delete note
exports.deleteNote = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "User is not authenticated" });
        }

        const noteId = req.params.id;

        const deleted = await Note.findOneAndDelete({
            _id: noteId,
            user: req.user.id
        });

        if (!deleted) {
            return res.status(404).json({ error: "Note not found or unauthorized" });
        }

        res.json({ message: "Note deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete note" });
    }
};
