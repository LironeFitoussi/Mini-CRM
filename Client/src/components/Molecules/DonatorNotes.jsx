// src/components/Molecules/DonatorNotes.jsx

import React, { useState, useEffect } from "react";
import {
  List,
  ListItem,
  IconButton,
  Box,
  Typography,
  TextField,
  CircularProgress,
  Paper,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useTranslation } from "react-i18next";
import ConfirmationModal from "../Modals/ConfirmationModal";
import { useSelector } from "react-redux";

// Function to add a new note
const addNote = async ({ donatorId, note, userId }) => {
  try {
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/v1/notes`,
      { note, donator: donatorId, user: userId }
    );
    return data;
  } catch (error) {
    console.error("Error adding note:", error.response?.data || error.message);
    throw error;
  }
};

// Function to delete a note
const deleteNote = async (noteId) => {
  try {
    await axios.delete(`${import.meta.env.VITE_API_URL}/api/v1/notes/${noteId}`);
  } catch (error) {
    console.error("Error deleting note:", error.response?.data || error.message);
    throw error;
  }
};

const DonatorNotes = ({ donatorId, note: initialNotes }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState(initialNotes || []);
  const [newNote, setNewNote] = useState("");
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);

  const currentUser = useSelector((state) => state.user.user);

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: ({ note }) => addNote({ donatorId, note, userId: currentUser?._id }),
    onSuccess: (newNote) => {
      const noteWithUserDetails = {
        ...newNote,
        userDetails: {
          fName: currentUser?.fName,
          lName: currentUser?.lName,
        },
      };

      setNotes((prevNotes) => [noteWithUserDetails, ...prevNotes]);
      queryClient.invalidateQueries(["notes", donatorId]);
      setNewNote("");
    },
    onError: (error) => {
      // Optionally handle error (e.g., show a notification)
      console.error("Failed to add note:", error);
      alert("Failed to add note.");
    },
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: (noteId) => deleteNote(noteId),
    onSuccess: () => {
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteToDelete));
      queryClient.invalidateQueries(["notes", donatorId]);
      setDeleteModalOpen(false);
    },
    onError: (error) => {
      // Optionally handle error (e.g., show a notification)
      console.error("Failed to delete note:", error);
      alert("Failed to delete note.");
    },
  });

  useEffect(() => {
    setNotes(initialNotes || []);
  }, [initialNotes]);

  const handleAddNote = () => {
    if (newNote.trim()) {
      addNoteMutation.mutate({ note: newNote });
    }
  };

  const handleOpenDeleteModal = (noteId) => {
    setNoteToDelete(noteId);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setNoteToDelete(null);
    setDeleteModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (noteToDelete) {
      deleteNoteMutation.mutate(noteToDelete);
    }
  };

  // Handle Enter key press for submitting the note
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddNote();
    }
  };

  // Sort notes by date (latest first)
  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // Handler for Add Reminder button
  const handleAddReminder = (noteId) => {
    alert("need to be implemented");
    // Future implementation can include opening a modal or navigating to a reminder setup page
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">{t("donatorNotes.title")}</Typography>
      </Box>

      {/* Inline TextField for Adding a New Note */}
      <Box display="flex" alignItems="center" mb={2}>
        <TextField
          label={t("donatorNotes.addNotePlaceholder")}
          variant="outlined"
          fullWidth
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={addNoteMutation.isLoading}
          placeholder={t("donatorNotes.addNotePlaceholder")}
        />
        {addNoteMutation.isLoading && (
          <CircularProgress size={24} style={{ marginLeft: 10 }} />
        )}
      </Box>

      {/* Notes List */}
      <Paper
        variant="outlined"
        style={{
          maxHeight: "25vh",
          overflowY: "auto",
          padding: "8px",
          borderRadius: "4px",
        }}
      >
        {sortedNotes.length > 0 ? (
          <List>
            {sortedNotes.map((note) => (
              <ListItem
                key={note.id || note._id}
                divider
                alignItems="center"
                style={{ padding: "8px 16px" }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  width="100%"
                >
                  {/* Note Content */}
                  <Typography variant="body1" style={{ flex: 1, marginRight: 16 }}>
                    {note.note}
                  </Typography>

                  {/* Add Reminder Button */}
                  {!note.nextContactDate && (
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={() => handleAddReminder(note.id || note._id)}
                      style={{ marginRight: 16 }}
                    >
                      {t("donatorNotes.addReminder")}
                    </Button>
                  )}

                  {/* Delete Button */}
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleOpenDeleteModal(note.id || note._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="textSecondary" align="center">
            {t("donatorNotes.noNotes")}
          </Typography>
        )}
      </Paper>

      {/* Confirmation Modal for Deleting a Note */}
      <ConfirmationModal
        open={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title={t("donatorNotes.deleteTitle")}
        description={t("donatorNotes.deleteDescription")}
        type="danger"
      />
    </Box>
  );
};

export default DonatorNotes;
