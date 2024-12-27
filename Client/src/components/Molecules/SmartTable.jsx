// SmartTable.jsx
import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Select, MenuItem, Switch, FormControl, InputLabel, Chip } from "@mui/material";
import PropTypes from 'prop-types';

const SmartTable = ({
  data,
  loading,
  onStatusToggle,
  onDonatorSelect,
  allDonators, // Full list of donators available for selection
}) => {
  console.log("Lead Data:", data);

  // Define the columns for the DataGrid
  const columns = [
    { field: "_id", headerName: "Donator Entry ID", width: 200 },
    { headerName: "Full Name", width: 150, renderCell: (params) => {
        // Manually find the donator entry from the full list
        const donatorEntry = allDonators.find((donator) => donator._id === params.row.donatorId._id);
        return donatorEntry ? `${donatorEntry.fName} ${donatorEntry.lName}` : "Unknown Donator";
        }
    },
    // Phone number
    { field: "donatorId?.phone_number_1", headerName: "Phone Number", width: 150 },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params) => {
        const handleStatusChange = (event) => {
          onStatusToggle(params.row._id, event.target.value); // Update with the selected value
        };
      
        return (
          <Select
            value={params.row.status} // Current status
            onChange={handleStatusChange}
            variant="outlined"
            size="small"
          >
            {/* Render each status option */}
            <MenuItem value="To Contact">To Contact</MenuItem>
            <MenuItem value="No Response">No Response</MenuItem>
            <MenuItem value="To Call Back">To Call Back</MenuItem>
            <MenuItem value="Meeting Scheduled">Meeting Scheduled</MenuItem>
            <MenuItem value="Not Interested">Not Interested</MenuItem>
            <MenuItem value="Nothing to Report">Nothing to Report</MenuItem>
          </Select>
        );
      }
    },
  ];

  // Map the donators array to rows for the DataGrid
  const rows = data?.donators?.map((donatorEntry) => ({
    id: donatorEntry._id, // Unique row ID for DataGrid
    ...donatorEntry, // Spread the donator entry fields
  })) || [];

  console.log("DataGrid Rows:", rows);

  return (
    <div style={{ height: 600, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        disableSelectionOnClick
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50]}
      />
    </div>
  );
};

// PropTypes for type checking
SmartTable.propTypes = {
  data: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    owner: PropTypes.shape({
      email: PropTypes.string.isRequired,
    }),
    donators: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
        donatorId: PropTypes.shape({
          _id: PropTypes.string.isRequired,
          fName: PropTypes.string.isRequired,
          lName: PropTypes.string.isRequired,
          allo_dons_id: PropTypes.string,
        }),
        status: PropTypes.string.isRequired,
      })
    ),
  }).isRequired,
  loading: PropTypes.bool,
  onStatusToggle: PropTypes.func.isRequired,
  onDonatorSelect: PropTypes.func.isRequired,
  allDonators: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      fName: PropTypes.string.isRequired,
      lName: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default SmartTable;
