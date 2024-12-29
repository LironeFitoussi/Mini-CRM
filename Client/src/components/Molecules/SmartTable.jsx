import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Select, MenuItem } from "@mui/material";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useState, useEffect } from "react";

const SmartTable = ({
  leadId,
  loading,
  onStatusToggle,
  onDonatorSelect,
  size,
}) => {
  const { t } = useTranslation();
  const [donators, setDonators] = useState([]);

  useEffect(() => {
    const fetchDonators = async () => {
      try {
        const response = await axios.get(
          import.meta.env.VITE_API_URL + `/api/v1/leads/${leadId}`
        );
        setDonators(response.data.leadCards);
      } catch (error) {
        console.error("Failed to fetch donators:", error);
      }
    };

    fetchDonators();
  }, [leadId]);

  const handleStatusToggle = (leadId, newStatus) => {
    // Update the status in the local state
    setDonators((prevDonators) =>
      prevDonators.map((entry) =>
        entry._id === leadId ? { ...entry, status: newStatus } : entry
      )
    );

    // Call the parent callback if needed
    onStatusToggle && onStatusToggle(leadId, newStatus);
  };

  const columns = [
    {
      field: "lName",
      headerName: t("lName"),
      flex: 1, // Adjust flex value to define proportion
    },
    {
      field: "fName",
      headerName: t("fName"),
      flex: 1,
    },
    {
      field: "email_1",
      headerName: t("Email"),
      flex: 2, // Make this column larger
      valueGetter: (params) => params?.row?.email_1 || "N/A",
    },
    {
      field: "phone",
      headerName: t("Phone"),
      flex: 1,
      valueGetter: (params) => params?.row?.phone_number_1 || "N/A",
    },
    {
      field: "status",
      headerName: "Status",
      flex: 2, // Provide more space for the status dropdown
      renderCell: (params) => {
        if (!params.row || typeof params.row.status === "undefined") {
          return "N/A";
        }
  
        const handleChange = (event) => {
          const newStatus = event.target.value;
          handleStatusToggle(params.row.leadId, newStatus);
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
            <MenuItem value="To Call Back">{t("menuItems.toCallBack")}</MenuItem>
            <MenuItem value="Meeting Scheduled">{t("menuItems.meetingScheduled")}</MenuItem>
            <MenuItem value="Not Interested">{t("menuItems.notInterested")}</MenuItem>
            <MenuItem value="Nothing to Report">{t("menuItems.nothingToReport")}</MenuItem>
          </Select>
        );
      },
    },
  ];  

  const rows = donators.map((donatorEntry) => ({
    leadId: donatorEntry._id,
    status: donatorEntry.status,
    ...donatorEntry.donator[0],
  }));

  return (
    <div style={{ height: 600, width: size }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        disableSelectionOnClick
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50]}
        autoHeight
        onRowClick={(row) => onDonatorSelect(row.row._id)}
      />
    </div>
  );
};

export default SmartTable;
