// DonatorNotes.jsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  List,
  ListItem,
  Button,
  IconButton,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import DeleteIcon from "@mui/icons-material/Delete";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DoneIcon from "@mui/icons-material/Done";
import RestoreIcon from "@mui/icons-material/Restore";

import ConfirmationModal from "../Modals/ConfirmationModal";
import NextContactDateModal from "../Modals/NextContactDateModal";
import NewNoteInput from "./NewNoteInput"; // child component for new note
import { useDonatorNotes } from "../../queryhooks/useDonatorNotes";

const DonatorNotes = ({ donatorId }) => {
  const { t } = useTranslation();

  // Step 1: Get data & mutations from the custom hook
  const {
    notes,
    isLoading,
    isError,
    error,
    addNoteMutation,
    deleteNoteMutation,
    toggleNoteMutation,
    setDueDateMutation,
  } = useDonatorNotes(donatorId);

  // Local states for modals
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [noteForDateUpdate, setNoteForDateUpdate] = useState(null);

  // Step 2: Sort your notes if desired
  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  // Step 3: Helper for checking “latest note”
  const isLatestNote = (note) => {
    if (notes.length === 1) return true;
    return notes[notes.length - 1]._id === note._id;
  };

  // Step 4: Child calls this to add a note
  const handleAddNote = (text) => {
    addNoteMutation.mutate({ note: text });
  };

  // Delete modal handlers
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

  // Next Contact Date modal handlers
  const handleOpenDateModal = (note) => {
    setNoteForDateUpdate(note);
    setIsDateModalOpen(true);
  };
  const handleDateSelect = (date) => {
    if (noteForDateUpdate) {
      setDueDateMutation.mutate({ noteId: noteForDateUpdate._id, date });
    }
  };

  // Step 5: Render loading and error states
  if (isLoading) return <CircularProgress />;
  if (isError) {
    return (
      <Typography color="error">
        {t("error.loadingNotes")}: {error.message}
      </Typography>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">{t("donatorNotes.title")}</Typography>
      </Box>

      {/* Child component for adding new notes */}
      <NewNoteInput
        onAddNote={handleAddNote}
        isLoading={addNoteMutation.isLoading}
        placeholder={t("donatorNotes.addNotePlaceholder")}
      />

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
                      textDecoration: note.isCompleted ? "line-through" : "none",
                      whiteSpace: "pre-wrap",  
                      wordWrap: "break-word",  
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
                        textDecoration: note.isCompleted ? "line-through" : "none",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {isLatestNote(note) && (
                        <ModeEditIcon
                          sx={{ mr: 0.5, cursor: "pointer" }}
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
                        {note.isCompleted ? (
                          <RestoreIcon sx={{ color: "orange" }} />
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
