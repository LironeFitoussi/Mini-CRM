import React, { useState } from "react";
import {
  Modal,
  Button,
  Box,
  Typography,
  Alert,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import axios from "axios";
import useUsers from "../../queryhooks/useUsers"; // Hook to fetch users

const AddToOwnerModal = ({ open, onClose, selectedDonorId }) => {
  const { t } = useTranslation();
  const [selectedUser, setSelectedUser] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { users, isLoading: isUsersLoading } = useUsers("");

  // console.log(users);
  
  const handleAssignToTelepro = async () => {
    if (!selectedUser) {
      setErrorMessage(t("Please select a telepro."));
      return;
    }

    setAssigning(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/v1/donators/${selectedDonorId}/owner`,
        { owner: selectedUser }
      );
      onClose();
      setSelectedUser("");
      setErrorMessage("");
    } catch (error) {
      console.error("Failed to assign donor:", error);
      setErrorMessage(t("Failed to assign donors to the telepro. Please try again."));
    } finally {
      setAssigning(false);
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedUser("");
    setErrorMessage("");
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="add-to-telepro-modal-title"
      aria-describedby="add-to-telepro-modal-description"
    >
      <Box
        sx={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography
          id="add-to-telepro-modal-title"
          variant="h6"
          component="h2"
          gutterBottom
        >
          {t("Assign Selected Donors to Telepro")}
        </Typography>

        {/* User Selection */}
        {isUsersLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Select
            fullWidth
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            displayEmpty
            sx={{ mt: 2 }}
          >
            <MenuItem value="" disabled>
              {t("Select a telepro")}
            </MenuItem>
            {users?.map((user) => (
              <MenuItem key={user._id} value={user._id}>
                {user.fName} {user.lName}
              </MenuItem>
            ))}
          </Select>
        )}

        {/* Error Message */}
        {errorMessage && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {/* Action Buttons */}
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 2 }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleAssignToTelepro}
            disabled={assigning}
          >
            {assigning ? t("Assigning...") : t("Assign")}
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleClose}>
            {t("Cancel")}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddToOwnerModal;
