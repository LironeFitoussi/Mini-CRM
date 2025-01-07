// controllers/noteController.js
const Note = require("../models/Note.js");
const Donator = require("../models/Donator.js");
const Notification = require("../models/Notification.js");
// Get all notes
const getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find();
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Get all notes by user
const getAllUserNotes = async (req, res) => {
  try {
    const notes = await Note.find({ donator: req.params.donatorId });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Get a single note by ID
const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate("donator user");
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Create a new note
const createNote = async (req, res) => {
  try {
    const { note, donator, user } = req.body;
    const newNote = new Note({ note, donator, user });
    await newNote.save();
    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Update an existing note
const updateNote = async (req, res) => {
  try {
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    if (!updatedNote)
      return res.status(404).json({ message: "Note not found" });
    res.status(200).json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Set due date
const setDueDate = async (req, res) => {
  try {
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      { dueDate: req.body.dueDate, isCompleted: false },
      { new: true }
    );
    if (!updatedNote) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Set notification
    const notification = new Notification({
      title: "Note Due",
      type: "callback",
      userId: updatedNote.user,
      donatorId: updatedNote.donator,
    });

    await notification.save();

    updatedNote.notification = notification._id;
    await updatedNote.save();

    res.status(200).json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Delete a note
const deleteNote = async (req, res) => {
  try {
    const deletedNote = await Note.findByIdAndDelete(req.params.id);
    if (!deletedNote)
      return res.status(404).json({ message: "Note not found" });
    res.status(200).json({ message: "Note deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Toggle isCompleted
const toggleIsCompleted = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    note.isCompleted = !note.isCompleted;
    await note.save();

    // if note is completed, archive notification
    if (note.isCompleted) {
      const notification = await Notification.findOneAndUpdate(
        note.notification,
        { archived: true }
      );

      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
    } else if (!note.isCompleted) {
      // if note is not completed and has a due date, set notification
      const notification = await Notification.findOneAndUpdate(
        note.notification,
        { archived: false }
      );

      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      } 
    }

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

module.exports = {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  setDueDate,
  toggleIsCompleted,
  getAllUserNotes,
};
