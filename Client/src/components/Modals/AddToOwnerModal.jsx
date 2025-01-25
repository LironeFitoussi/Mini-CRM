import React, { useState, useEffect } from "react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import useUsers from "../../queryhooks/useUsers"; // Hook to fetch users



const assignDonorOwner = async ({ donorId, ownerId }) => {
  await axios.put(
    `${import.meta.env.VITE_API_URL}/api/v1/donors/${donorId}/owner`,
    { owner: ownerId }
  );
};

const AddToOwnerModal = ({ open, onClose, selectedDonorId }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [selectedUser, setSelectedUser] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { users, isLoading: isUsersLoading } = useUsers("");

  // Mutation for assigning owner
  const mutation = useMutation({
    mutationFn: assignDonorOwner,
    onSuccess: () => {
      queryClient.invalidateQueries(["donorOwner", selectedDonorId]);
      onClose();
    },
    onError: (error) => {
      console.error("Failed to assign donor:", error);
      setErrorMessage(
        t("Failed to assign donors to the telepro. Please try again.")
      );
    },
  });

  const handleAssignToTelepro = () => {
    if (!selectedUser) {
      setErrorMessage(t("Please select a telepro."));
      return;
    }

    mutation.mutate({ donorId: selectedDonorId, ownerId: selectedUser });
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

        {/* {isDonorLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Typography sx={{ mt: 2 }}>
            {t("Current Owner")}: {donorOwner?.owner?.fName || t("Unassigned")}
          </Typography>
        )} */}

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

        {errorMessage && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 2 }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleAssignToTelepro}
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? t("Assigning...") : t("Assign")}
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
