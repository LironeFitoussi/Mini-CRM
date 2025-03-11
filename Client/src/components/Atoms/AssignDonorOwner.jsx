import { useState, useEffect } from "react";
import { Box, Select, MenuItem, CircularProgress, Alert } from "@mui/material";
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
  AssignDonorOwner.propTypes = {
    currentOwner: PropTypes.object.isRequired,
    selectedDonorId: PropTypes.string.isRequired,
  };

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
    return <Alert severity="error">{t("Failed to load telepros.")}</Alert>;
  }

  return (
    <Box>
      {isUsersLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Select
            fullWidth
            displayEmpty
            value={selectedOwner}
            onChange={handleChange}
            sx={{
              width: "50%",
            }}
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
        </>
      )}
    </Box>
  );
};

export default AssignDonorOwner;
