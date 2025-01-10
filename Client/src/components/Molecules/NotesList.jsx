// NotesList.jsx
import React from "react";
import { List, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import NoteItem from "../Atoms/NoteItem.jsx";

const NotesList = ({
  notes,
  isLatestNote,
  onDelete,
  onToggle,
  onEditDate,
  setDueDateLoading,
}) => {
  const { t } = useTranslation();

  return notes.length > 0 ? (
    <List>
      {notes.map((note) => (
        <NoteItem
          key={note.id || note._id}
          note={note}
          isLatest={isLatestNote(note)}
          onDelete={onDelete}
          onToggle={onToggle}
          onEditDate={onEditDate}
          setDueDateLoading={setDueDateLoading}
        />
      ))}
    </List>
  ) : (
    <Typography variant="body2" color="textSecondary" align="center">
      {t("donatorNotes.noNotes")}
    </Typography>
  );
};

export default NotesList;
