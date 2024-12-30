// SmartTable.jsx

import React, { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Select, MenuItem, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import NextContactDateModal from "../Modals/NextContactDateModal"; 
import useLeadList from "../../queryhooks/useLeadList"; 
import axios from "axios";
// import "./SmartTable.css"; // Import the CSS file

const SmartTable = ({
  leadId,
  loading: externalLoading,
  onStatusToggle,
  onDonatorSelect,
  size,
}) => {
  const { t } = useTranslation();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeadCardId, setLeadCardId] = useState(null);

  // Use custom hook for fetching lead list
  const { data, isLoading, isError, error, invalidateLeadList } = useLeadList(leadId);

  const donators = data?.leadCards || [];

  const handleStatusToggle = (leadCardId, newStatus) => {
    console.log("Updating status for lead:", leadCardId, "to", newStatus);
    
    // Optionally trigger a mutation here if updating on the server
    onStatusToggle && onStatusToggle(leadCardId, newStatus);
    invalidateLeadList(); // Refresh data after update
  };

  const handleOpenModal = (leadCardId) => {
    setLeadCardId(leadCardId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setLeadCardId(null);
    setIsModalOpen(false);
  };

  const handleDateSelect = async (isoDate) => {
    if (!selectedLeadCardId) {
      console.log("No lead card selected");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/leads/callback/${selectedLeadCardId}`,
        { nextContactDate: isoDate }
      );
      console.log("Next contact date updated successfully");
      invalidateLeadList(); // Refresh data after update
    } catch (error) {
      console.error("Failed to update next contact date:", error);
    }

    handleCloseModal();
  };

  if (isLoading || externalLoading) {
    return <div>{t("loading")}</div>;
  }

  if (isError) {
    return <div>{t("error", { message: error.message })}</div>;
  }

  if (!leadId) {
    return <div>{t("selectLead")}</div>;
  }

  const columns = [
    {
      field: "lName",
      headerName: t("lName"),
      flex: 1,
    },
    {
      field: "fName",
      headerName: t("fName"),
      flex: 1,
    },
    {
      field: "email",
      headerName: t("Email"),
      flex: 2,
    },
    {
      field: "phoneNumber",
      headerName: t("Phone"),
      flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 2,
      renderCell: (params) => {
        if (!params.row || typeof params.row.status === "undefined") {
          return "N/A";
        }

        const handleChange = (event) => {
          if (event.target.value === "To Call Back") {
            handleOpenModal(params.row.leadCardId);
            return;
          }
          const newStatus = event.target.value;
          handleStatusToggle(params.row.leadCardId, newStatus);
        };

        return (
          <Select
            value={params.row.status || ""}
            onChange={handleChange}
            variant="outlined"            
            size="small"
            fullWidth
          >
            <MenuItem value="To Contact">{t("menuItems.toContact")}</MenuItem>
            <MenuItem value="No Response">{t("menuItems.noResponse")}</MenuItem>
            <MenuItem value="To Call Back">
              {t("menuItems.toCallBack")}
            </MenuItem>
            <MenuItem value="Meeting Scheduled">
              {t("menuItems.meetingScheduled")}
            </MenuItem>
            <MenuItem value="Not Interested">
              {t("menuItems.notInterested")}
            </MenuItem>
            <MenuItem value="Nothing to Report">
              {t("menuItems.nothingToReport")}
            </MenuItem>
          </Select>
        );
      },
    },
    {
      field: "nextContactDate",
      headerName: "Next Contact Date",
      flex: 2,
      renderCell: (params) => {
        const formattedDate = params.row.nextContactDate
          ? new Date(params.row.nextContactDate).toLocaleString(undefined, {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false, // Ensures 24-hour format
            })
          : "N/A";

        return (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <Typography variant="body2">
              {formattedDate}
            </Typography>
          </div>
        );
      },
    },
  ];

  const rows = donators.map((donatorEntry) => ({
    id: donatorEntry._id,
    leadCardId: donatorEntry._id,
    status: donatorEntry.status,
    phoneNumber: donatorEntry.donator[0].phone_number_1?.number || "N/A",
    email: donatorEntry.donator[0].email_1?.email || "N/A",
    nextContactDate: donatorEntry.nextContactDate || null,
    ...donatorEntry.donator[0],
  }));

  // Function to determine row class based on nextContactDate
  const getRowClassName = (params) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (!params.row.nextContactDate) {
      return "row-today"; // Default to today styling if no date is set
    }

    const contactDate = new Date(params.row.nextContactDate);
    const contactDay = new Date(contactDate.getFullYear(), contactDate.getMonth(), contactDate.getDate());

    if (contactDay.getTime() === today.getTime()) {
      return "row-today";
    } else if (contactDay > today) {
      return "row-upcoming";
    } else {
      return "row-past";
    }
  };

  return (
    <div style={{ height: 600, width: size }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={isLoading || externalLoading}
        disableSelectionOnClick
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50]}
        autoHeight
        onRowClick={(row) => onDonatorSelect(row.row._id)}
        getRowClassName={getRowClassName} // Add this prop for dynamic styling
      />

      <NextContactDateModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onDateSelect={handleDateSelect}
      />
    </div>
  );
};

export default SmartTable;
