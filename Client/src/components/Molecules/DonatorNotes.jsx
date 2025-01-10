// DonatorNotes.jsx
import React, { useState } from "react";
import { Box, Typography, CircularProgress, Paper } from "@mui/material";
import { useTranslation } from "react-i18next";

import ConfirmationModal from "../Modals/ConfirmationModal";
import NextContactDateModal from "../Modals/NextContactDateModal";
import NewNoteInput from "./NewNoteInput";
import NotesList from "./NotesList"; // New child component
import { useDonatorNotes } from "../../queryhooks/useDonatorNotes";

const DonatorNotes = ({ donatorId }) => {
  const { t } = useTranslation();

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

  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [noteForDateUpdate, setNoteForDateUpdate] = useState(null);

  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const isLatestNote = (note) => {
    if (notes.length === 1) return true;
    return notes[notes.length - 1]._id === note._id;
  };

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
      deleteNoteMutation.mutate(noteToDelete, {
        onSuccess: () => {
          handleCloseDeleteModal();
        },
        onError: (deleteError) => {
          console.error("Error deleting note:", deleteError);
        },
      });
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
        <NotesList
          notes={sortedNotes}
          isLatestNote={isLatestNote}
          onDelete={handleOpenDeleteModal}
          onToggle={toggleNoteMutation.mutate}
          onEditDate={handleOpenDateModal}
          setDueDateLoading={setDueDateMutation.isLoading}
        />
      </Paper>

      {addNoteMutation.isError && (
        <Typography color="error" sx={{ mt: 1 }}>
          {t("donatorNotes.addNoteError")}: {addNoteMutation.error.message}
        </Typography>
      )}

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
