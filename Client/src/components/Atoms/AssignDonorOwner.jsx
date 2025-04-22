import { useState, useEffect } from "react";
import { Box, Select, MenuItem, CircularProgress, Alert, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import useUsers from "../../queryhooks/useUsers"; // Hook to fetch users
import PropTypes from 'prop-types';

const assignDonorOwner = async ({ donorId, ownerId }) => {
  await axios.put(
    `${import.meta.env.VITE_API_URL}/api/v1/donors/${donorId}/owner`,
    { owner: ownerId }
  );
};

const AssignDonorOwner = ({ currentOwner, selectedDonorId }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [selectedOwner, setSelectedOwner] = useState("");
  
  const {
    users,
    isLoading: isUsersLoading,
    isError: isUsersError,
  } = useUsers("");

  const assignOwnerMutation = useMutation({
    mutationFn: assignDonorOwner,
    onSuccess: () => {
      queryClient.invalidateQueries(["donorOwner", selectedDonorId]);
    },
    onError: () => {
      setError(t("Failed to assign donor to the telepro. Please try again."));
    },
  });

  useEffect(() => {
    if (currentOwner && users) {
      const owner = users.find(
        (user) => user._id === currentOwner._id
      );
      if (owner) {
        setSelectedOwner(owner._id);
      }
    }
  }, [currentOwner, users]);

  const handleChange = (event) => {
    const ownerId = event.target.value;
    setSelectedOwner(ownerId);
    assignOwnerMutation.mutate({ donorId: selectedDonorId, ownerId });
  };

  if (isUsersError) {
    return (
      <Box component="span" sx={{ display: "inline-block", width: "100%" }}>
        <Alert severity="error" component="span" sx={{ mb: 2 }}>
          {t("Failed to load telepros.")}
        </Alert>
      </Box>
    );
  }

  return (
    <Box component="span" sx={{ display: "inline-block", width: "100%" }}>
      {isUsersLoading ? (
        <Box 
          component="span" 
          sx={{ 
            display: "inline-flex", 
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
            width: "100%"
          }}
        >
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            {t("Loading telepros...")}
          </Typography>
        </Box>
      ) : (
        <>
          {error && (
            <Alert severity="error" component="span" sx={{ mb: 2, display: "block" }}>
              {error}
            </Alert>
          )}
          {assignOwnerMutation.isPending && (
            <Box 
              sx={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 1,
                mb: 1
              }}
            >
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">
                {t("Updating owner...")}
              </Typography>
            </Box>
          )}
          <Select
            fullWidth
            displayEmpty
            value={selectedOwner}
            onChange={handleChange}
            disabled={assignOwnerMutation.isPending}
            sx={{
              width: "50%",
            }}
          >
            <MenuItem value="" disabled>
              {t("telepro.selectOwner")}
            </MenuItem>
            {users?.map((user) => (
              <MenuItem key={user._id} value={user._id}>
                {user.fName} {user.lName}
              </MenuItem>
            ))}
          </Select>
        </>
      )}
    </Box>
  );
};

AssignDonorOwner.propTypes = {
  currentOwner: PropTypes.object.isRequired,
  selectedDonorId: PropTypes.string.isRequired,
};

export default AssignDonorOwner;
