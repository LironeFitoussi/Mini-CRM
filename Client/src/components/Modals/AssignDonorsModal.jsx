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
  TextField,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// WORK!
const fetchDonors = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/v1/donors?limit=2000`
  );
  //   console.log(data.donors);
  return data.donors;
};

const assignDonorsToOwner = async ({ donorIds, ownerId }) => {
  console.log(donorIds);

  await axios.put(`${import.meta.env.VITE_API_URL}/api/v1/donors/assign`, {
    donors: donorIds,
    owner: ownerId,
  });
};

const AssignDonorsModal = ({
  open,
  onClose,
  selectedDonorIds,
  selectedUserId,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [selectedStatus, setSelectedStatus] = useState("");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch donors
  const { data: donors, isLoading: isDonorsLoading } = useQuery({
    queryKey: ["donors"],
    queryFn: fetchDonors,
  });

  // Mutation for assigning donors
  const mutation = useMutation({
    mutationFn: assignDonorsToOwner,
    onSuccess: () => {
      // Clear error message and reset states
      setErrorMessage("");
      queryClient.invalidateQueries(["donorOwners"]);
      onClose();
    },
    onError: (error) => {
      console.error("Failed to assign donors:", error);
      setErrorMessage(
        t("Failed to assign donors to the telepro. Please try again.")
      );
    },
  });

  const handleClose = () => {
    onClose();
    // Reset all states, including error messages and filters
    setSelectedStatus("");
    setRangeStart("");
    setRangeEnd("");
    setErrorMessage("");
  };

  const handleAssignToTelepro = () => {
    if (!selectedUserId) {
      setErrorMessage(t("No telepro selected."));
      return;
    }

    // Filter donors based on range and status
    let filteredDonorIds = donors?.map((donor) => donor._id) || [];

    if (selectedStatus) {
      filteredDonorIds = donors
        .filter((donor) => donor.status === selectedStatus)
        .map((donor) => donor._id);
    }

    if (rangeStart !== "" && rangeEnd !== "") {
      const start = parseInt(rangeStart, 10);
      const end = parseInt(rangeEnd, 10);
      filteredDonorIds = donors.slice(start, end).map((donor) => donor._id);
    }

    if (!filteredDonorIds || filteredDonorIds.length === 0) {
      setErrorMessage(t("No donors match the selected criteria."));
      return;
    }

    // Perform the mutation and clear errors if successful
    mutation.mutate({ donorIds: filteredDonorIds, ownerId: selectedUserId });
  };

  const statusOptions = [
    { value: "To Contact", label: t("menuItems.toContact") },
    { value: "No Response", label: t("menuItems.noResponse") },
    { value: "To Call Back", label: t("menuItems.toCallBack") },
    { value: "Not Interested", label: t("menuItems.notInterested") },
    { value: "To Validate", label: t("menuItems.toValidate") },
    { value: "Done", label: t("menuItems.done") },
  ];

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="assign-donors-modal-title"
      aria-describedby="assign-donors-modal-description"
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
          id="assign-donors-modal-title"
          variant="h6"
          component="h2"
          gutterBottom
        >
          {t("Assign Selected Donors to Telepro")}
        </Typography>

        {isDonorsLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Select
              fullWidth
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              displayEmpty
              sx={{ mt: 2 }}
            >
              <MenuItem value="">{t("filter.byStatus")}</MenuItem>
              {statusOptions.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>

            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <TextField
                label={t("filter.startRange")}
                type="number"
                fullWidth
                value={rangeStart}
                onChange={(e) => setRangeStart(e.target.value)}
              />
              <TextField
                label={t("filter.endRange")}
                type="number"
                fullWidth
                value={rangeEnd}
                onChange={(e) => setRangeEnd(e.target.value)}
              />
            </Box>
          </>
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
            {t("actions.cancel")}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AssignDonorsModal;
