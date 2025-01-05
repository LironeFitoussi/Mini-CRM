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
import NextContactDateModal from "../Modals/NextContactDateModal";

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
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [noteForDateUpdate, setNoteForDateUpdate] = useState(null);

  const currentUser = useSelector((state) => state.user.user);

  const setDueDate = async (noteId, date) => {
    try {
      const { data } = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/v1/notes/${noteId}/dueDate`,
        { dueDate: date }
      );
      return data;
    } catch (error) {
      console.error("Error setting due date:", error.response?.data || error.message);
      throw error;
    }
  };

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
      console.error("Failed to delete note:", error);
      alert("Failed to delete note.");
    },
  });

  // Update due date mutation
  const setDueDateMutation = useMutation({
    mutationFn: ({ noteId, date }) => setDueDate(noteId, date),
    onSuccess: (updatedNote) => {
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note._id === updatedNote._id ? { ...note, nextContactDate: updatedNote.nextContactDate } : note
        )
      );
      queryClient.invalidateQueries(["notes", donatorId]);
      setIsDateModalOpen(false);
      setNoteForDateUpdate(null);
    },
    onError: (error) => {
      console.error("Failed to set due date:", error);
      alert("Failed to set due date.");
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

  const handleOpenDateModal = (note) => {
    setNoteForDateUpdate(note);
    setIsDateModalOpen(true);
  };

  const handleDateSelect = (date) => {
    if (noteForDateUpdate) {
      setDueDateMutation.mutate({ noteId: noteForDateUpdate._id, date });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddNote();
    }
  };

  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">{t("donatorNotes.title")}</Typography>
      </Box>

      <Box display="flex" alignItems="center" mb={2}>
        <TextField
          label={t("donatorNotes.addNotePlaceholder")}
          variant="outlined"
          fullWidth
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={addNoteMutation.isLoading}
        />
        {addNoteMutation.isLoading && (
          <CircularProgress size={24} style={{ marginLeft: 10 }} />
        )}
      </Box>

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
              <ListItem key={note.id || note._id} divider alignItems="center" style={{ padding: "8px 16px" }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                  <Typography variant="body1" style={{ flex: 1, marginRight: 16 }}>
                    {note.note}
                  </Typography>

                  {!note.nextContactDate && (
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={() => handleOpenDateModal(note)}
                      style={{ marginRight: 16 }}
                    >
                      {t("donatorNotes.addReminder")}
                    </Button>
                  )}

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

      <ConfirmationModal
        open={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title={t("donatorNotes.deleteTitle")}
        description={t("donatorNotes.deleteDescription")}
        type="danger"
      />

      <NextContactDateModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        onDateSelect={handleDateSelect}
      />
    </Box>
  );
};

export default DonatorNotes;