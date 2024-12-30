import React, { useState, useEffect } from "react";
import {
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
    Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useTranslation } from "react-i18next";
import ConfirmationModal from "../Modals/ConfirmationModal";
import AddCommentIcon from '@mui/icons-material/AddComment';
import { useSelector } from "react-redux";

// Function to add a new note
const addNote = async ({ donatorId, note, userId }) => {
  console.log("donatorId", donatorId);
  console.log("note", note);
  console.log("userId", userId);
  
  try {
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/v1/notes`,
      { note, donator: donatorId, user: userId }
    );
    return data;
  } catch (error) {
    console.error("Error adding note:", error.response.data);
    throw error;
  }
};

// Function to delete a note
const deleteNote = async (noteId) => {
  await axios.delete(`${import.meta.env.VITE_API_URL}/api/v1/notes/${noteId}`);
};

const DonatorNotes = ({ donatorId, note: initialNotes }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState(initialNotes || []);
  const [newNote, setNewNote] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
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
      setModalOpen(false);
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
  });

  useEffect(() => {
    setNotes(initialNotes || []);
  }, [initialNotes]);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => {
    setModalOpen(false);
    setNewNote("");
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      addNoteMutation.mutate({ note: newNote });
      setNewNote("");
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

  // Sort notes by date (latest first)
  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <div>
        <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography variant="h6">{t("donatorNotes.title")}</Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpenModal}
        style={{ margin: "10px 0" }}
      >
        {/* {t("donatorNotes.addNote")} */}
        <AddCommentIcon />
      </Button>
        </Box>
      {addNoteMutation.isLoading && (
        <CircularProgress size={24} style={{ margin: "10px 0" }} />
      )}
      <div
        style={{
          maxHeight: "25vh",
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: "8px",
          borderRadius: "4px",
        }}
      >
        {sortedNotes.length > 0 ? (
          <List>
            {sortedNotes.map((note) => (
              <ListItem key={note.id || note._id} divider>
                <ListItemText
                  primary={note.note}
                  secondary={`${t("donatorNotes.by")}: ${
                    note.userDetails?.fName || t("donatorNotes.unknown")
                  } ${note.userDetails?.lName || ""} ${t(
                    "donatorNotes.on"
                  )} ${new Date(note.date).toLocaleDateString()}`}
                />
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleOpenDeleteModal(note.id || note._id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="textSecondary">
            {t("donatorNotes.noNotes")}
          </Typography>
        )}
      </div>

      {/* Modal for Adding a New Note */}
      <Dialog open={isModalOpen} onClose={handleCloseModal}>
        <DialogTitle>{t("donatorNotes.addNewNote")}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t("donatorNotes.noteLabel")}
            type="text"
            fullWidth
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">
            {t("donatorNotes.cancel")}
          </Button>
          <Button
            onClick={handleAddNote}
            color="primary"
            disabled={addNoteMutation.isLoading}
          >
            {addNoteMutation.isLoading
              ? t("donatorNotes.adding")
              : t("donatorNotes.addNote")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Modal for Deleting a Note */}
      <ConfirmationModal
        open={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title={t("donatorNotes.deleteTitle")}
        description={t("donatorNotes.deleteDescription")}
        type="danger"
      />
    </div>
  );
};

export default DonatorNotes;
