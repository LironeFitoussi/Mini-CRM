import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import SmartTable from "../../components/Molecules/SmartTable.jsx";
import CreateLeadModal from "../../components/Modals/CreateLeadModal.jsx";
import DonatorCard from "../../components/Molecules/DonatorCard.jsx";
import useLeads from "../../queryhooks/useLeads";
import axios from "axios";

const LeadsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedDonorId, setSelectedDonorId] = useState(null);
  const [isCardVisible, setIsCardVisible] = useState(false);

  const {
    data: leads,
    isLoading,
    isError,
    createLead,
    invalidateLeads,
  } = useLeads();

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleCreateLead = (leadData) => {
    createLead.mutate(leadData, {
      onSuccess: () => {
        setIsModalOpen(false);
        setSelectedLead(null); // Reset selection after creating a lead
      },
    });
  };

  const handleLeadSelection = (event) => {
    const selected = leads?.find((lead) => lead._id === event.target.value);
    setSelectedLead(selected);
  };

  const handleStatusToggle = async (leadCardId, newStatus) => {
    try {
      const res = await axios.put(
        import.meta.env.VITE_API_URL + `/api/v1/leads/${leadCardId}/status`,
        {
          status: newStatus,
        }
      );
      // console.log("Status updated successfully", res.data);
      invalidateLeads();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleDonatorSelect = (selectedDonatorId) => {
    setSelectedDonorId(selectedDonatorId);
    setIsCardVisible(true);
  };

  const closeCard = () => {
    setIsCardVisible(false);
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading Leads...
        </Typography>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          Failed to load leads. Please try again later.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, display: "flex"}}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="h4" gutterBottom>
          Leads Management
        </Typography>

        <Select
          fullWidth
          value={selectedLead?._id || ""}
          onChange={handleLeadSelection}
          displayEmpty
          sx={{ mb: 2 }}
        >
          <MenuItem value="" disabled>
            Select a Lead
          </MenuItem>
          {leads?.map((lead) => (
            <MenuItem key={lead._id} value={lead._id}>
              {lead.title}
            </MenuItem>
          ))}
        </Select>

        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenModal}
          sx={{ mb: 2 }}
        >
          Create New Lead
        </Button>

        <Paper sx={{ p: 2 }}>
          {selectedLead ? (
            <SmartTable
              leadId={selectedLead._id}
              loading={isLoading}
              onStatusToggle={handleStatusToggle}
              onDonatorSelect={handleDonatorSelect}
              size={isCardVisible ? "76vw" : "92vw"}
            />
          ) : (
            <Typography variant="h6" align="center">
              No Lead Selected
            </Typography>
          )}
        </Paper>

        <CreateLeadModal
          open={isModalOpen}
          onClose={handleCloseModal}
          handleCreateLead={handleCreateLead}
        />
      </Box>

      {isCardVisible && (
        <DonatorCard
          donatorId={selectedDonorId}
          onClose={closeCard}
        />
      )}
    </Box>
  );
};

export default LeadsPage;
