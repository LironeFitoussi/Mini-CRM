import React, { useState } from "react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useTranslation } from "react-i18next";
import ConfirmationModal from "../Modals/ConfirmationModal";
import { useSelector } from "react-redux";
import NextContactDateModal from "../Modals/NextContactDateModal";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DoneIcon from "@mui/icons-material/Done";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

// API Calls
const fetchNotes = async ({ queryKey }) => {
  const [_, donatorId] = queryKey;
  // console.log(donatorId);
  
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/v1/notes/donator/${donatorId}`
  );
  return data;
};

const addNote = async ({ donatorId, note, userId }) => {
  const { data } = await axios.post(
    `${import.meta.env.VITE_API_URL}/api/v1/notes`,
    { note, donator: donatorId, user: userId }
  );
  return data;
};

const deleteNote = async (noteId) => {
  await axios.delete(`${import.meta.env.VITE_API_URL}/api/v1/notes/${noteId}`);
};

const toggleNoteStatus = async (noteId) => {
  const { data } = await axios.patch(
    `${import.meta.env.VITE_API_URL}/api/v1/notes/${noteId}/toggleIsCompleted`
  );
  return data;
};

const setDueDate = async ({ noteId, date }) => {
  const { data } = await axios.patch(
    `${import.meta.env.VITE_API_URL}/api/v1/notes/${noteId}/dueDate`,
    { dueDate: date }
  );
  return data;
};

const DonatorNotes = ({ donatorId }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const currentUser = useSelector((state) => state.user.user);
  const [newNote, setNewNote] = useState("");
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [noteForDateUpdate, setNoteForDateUpdate] = useState(null);

  // Fetch Notes using useQuery (Updated for v5)
  const {
    data: notes = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["notes", donatorId],
    queryFn: fetchNotes,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // console.log(notes);
  

  // Add Note Mutation with Optimistic Update (Updated for v5)
  const addNoteMutation = useMutation({
    mutationFn: ({ note }) =>
      addNote({ donatorId, note, userId: currentUser?._id }),
    onMutate: async ({ note }) => {
      await queryClient.cancelQueries({ queryKey: ["notes", donatorId] });

      const previousNotes = queryClient.getQueryData(["notes", donatorId]);

      const tempId = `temp-${new Date().getTime()}`;

      const newNoteEntry = {
        _id: tempId, // Temporary ID
        note,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        dueDate: null,
        user: currentUser,
      };

      queryClient.setQueryData(["notes", donatorId], (old) => [
        ...old,
        newNoteEntry,
      ]);

      return { previousNotes, tempId };
    },
    onError: (err, variables, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(["notes", donatorId], context.previousNotes);
      }
      // Optionally, display an error message (e.g., toast notification)
    },
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(["notes", donatorId], (old) =>
        old.map((note) => (note._id === context.tempId ? data : note))
      );
      setNewNote("");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", donatorId] });
    },
  });

  // Delete Note Mutation with Optimistic Update (Updated for v5)
  const deleteNoteMutation = useMutation({
    mutationFn: (noteId) => deleteNote(noteId),
    onMutate: async (noteId) => {
      await queryClient.cancelQueries({ queryKey: ["notes", donatorId] });

      const previousNotes = queryClient.getQueryData(["notes", donatorId]);

      queryClient.setQueryData(["notes", donatorId], (old) =>
        old.filter((note) => note._id !== noteId && note.id !== noteId)
      );

      return { previousNotes };
    },
    onError: (err, noteId, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(["notes", donatorId], context.previousNotes);
      }
      // Optionally, display an error message
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", donatorId] });
      setDeleteModalOpen(false);
    },
  });

  // Toggle Note Status Mutation with Optimistic Update (Updated for v5)
  const toggleNoteMutation = useMutation({
    mutationFn: (noteId) => toggleNoteStatus(noteId),
    onMutate: async (noteId) => {
      await queryClient.cancelQueries({ queryKey: ["notes", donatorId] });

      const previousNotes = queryClient.getQueryData(["notes", donatorId]);

      queryClient.setQueryData(["notes", donatorId], (old) =>
        old.map((note) =>
          note._id === noteId || note.id === noteId
            ? { ...note, isCompleted: !note.isCompleted }
            : note
        )
      );

      return { previousNotes };
    },
    onError: (err, noteId, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(["notes", donatorId], context.previousNotes);
      }
      // Optionally, display an error message
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", donatorId] });
    },
  });

  // Set Due Date Mutation with Optimistic Update (Updated for v5)
  const setDueDateMutation = useMutation({
    mutationFn: ({ noteId, date }) => setDueDate({ noteId, date }),
    onMutate: async ({ noteId, date }) => {
      await queryClient.cancelQueries({ queryKey: ["notes", donatorId] });

      const previousNotes = queryClient.getQueryData(["notes", donatorId]);

      queryClient.setQueryData(["notes", donatorId], (old) =>
        old.map((note) =>
          note._id === noteId || note.id === noteId
            ? { ...note, dueDate: date }
            : note
        )
      );

      return { previousNotes };
    },
    onError: (err, variables, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(["notes", donatorId], context.previousNotes);
      }
      // Optionally, display an error message
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", donatorId] });
      setIsDateModalOpen(false);
      setNoteForDateUpdate(null);
    },
  });

  const isLatestNote = (note) => {
    if (notes.length === 1) return true;
    return notes[notes.length - 1]._id === note._id;
  };

  // Handlers
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

  // Sort notes by createdAt descending
  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  // Render Loading and Error States
  if (isLoading) return <CircularProgress />;
  if (isError)
    return (
      <Typography color="error">
        {t("error.loadingNotes")}: {error.message}
      </Typography>
    );

  return (
    <Box>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">{t("donatorNotes.title")}</Typography>
      </Box>

      {/* Add Note Section */}
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
          <CircularProgress size={24} sx={{ marginLeft: 2 }} />
        )}
      </Box>

      {/* Notes List */}
      <Paper
        variant="outlined"
        sx={{
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
                sx={{ padding: "8px 16px" }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  width="100%"
                >
                  {/* Note Text */}
                  <Typography
                    variant="body1"
                    sx={{
                      flex: 1,
                      marginRight: 2,
                      textDecoration: note.isCompleted
                        ? "line-through"
                        : "none",
                    }}
                  >
                    {note.note}
                  </Typography>

                  {/* Due Date */}
                  {!note.dueDate ? (
                    isLatestNote(note) && (
                      <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={() => handleOpenDateModal(note)}
                      sx={{ marginRight: 2 }}
                      disabled={setDueDateMutation.isLoading}
                    >
                      {t("donatorNotes.addReminder")}
                    </Button>
                    )
                  ) : (
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{
                        textDecoration: note.isCompleted
                          ? "line-through"
                          : "none",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {isLatestNote(note) && (
                        <ModeEditIcon
                        sx={{
                          mr: 0.5,
                          cursor: "pointer",
                        }}
                        onClick={() => handleOpenDateModal(note)}
                      />
                      )}
                      {t("donatorNotes.nextContactDate")}:{" "}
                      {new Date(note.dueDate).toLocaleString("en-GB")}
                      {/* Toggle Status Button */}
                      <IconButton
                        edge="end"
                        aria-label="toggle-status"
                        onClick={() => toggleNoteMutation.mutate(note._id)}
                        disabled={toggleNoteMutation.isLoading}
                        sx={{ mr: 1 }}
                      >
                        {!note.isCompleted ? (
                          <AccessTimeIcon sx={{ color: "orange" }} />
                        ) : (
                          <DoneIcon sx={{ color: "green" }} />
                        )}
                      </IconButton>
                    </Typography>
                  )}

                  {/* Delete Button */}
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleOpenDeleteModal(note.id || note._id)}
                    disabled={deleteNoteMutation.isLoading}
                  >
                    <DeleteIcon sx={{ color: "red" }} />
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

      {/* Add Note Error */}
      {addNoteMutation.isError && (
        <Typography color="error" sx={{ mt: 1 }}>
          {t("donatorNotes.addNoteError")}: {addNoteMutation.error.message}
        </Typography>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title={t("donatorNotes.deleteTitle")}
        description={t("donatorNotes.deleteDescription")}
        type="danger"
      />

      {/* Next Contact Date Modal */}
      <NextContactDateModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        onDateSelect={handleDateSelect}
      />
    </Box>
  );
};

export default DonatorNotes;
