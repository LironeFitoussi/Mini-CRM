// NoteItem.jsx
import React from "react";
import {
  ListItem,
  Box,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import DeleteIcon from "@mui/icons-material/Delete";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DoneIcon from "@mui/icons-material/Done";
import RestoreIcon from "@mui/icons-material/Restore";

const NoteItem = ({
  note,
  isLatest,
  onDelete,
  onToggle,
  onEditDate,
  setDueDateLoading,
}) => {
  const { t } = useTranslation();

  return (
    <ListItem
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
          isLatest && (
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              onClick={() => onEditDate(note)}
              sx={{ marginRight: 2 }}
              disabled={setDueDateLoading}
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
            {isLatest && (
              <ModeEditIcon
                sx={{ mr: 0.5, cursor: "pointer" }}
                onClick={() => onEditDate(note)}
              />
            )}
            {t("donatorNotes.nextContactDate")}:{" "}
            {new Date(note.dueDate).toLocaleString("en-GB")}

            {/* Toggle Status Button */}
            <IconButton
              edge="end"
              aria-label="toggle-status"
              onClick={() => onToggle(note._id)}
              disabled={false /* Pass appropriate loading state if needed */}
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
          onClick={() => onDelete(note.id || note._id)}
          disabled={false /* Pass appropriate loading state if needed */}
        >
          <DeleteIcon sx={{ color: "red" }} />
        </IconButton>
      </Box>
    </ListItem>
  );
};

export default NoteItem;
