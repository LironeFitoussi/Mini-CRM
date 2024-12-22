// UsersTable.js
import React from "react";
import { DataGrid } from "@mui/x-data-grid";

const UsersTable = ({ rows, selectedRows, setSelectedRows }) => {
  const columns = [
    { field: "_id", headerName: "ID", width: 90 },
    {
      field: "fName",
      headerName: "First Name",
      width: 150,
    },
    {
      field: "lName",
      headerName: "Last Name",
      width: 150,
    },
    { field: "email", headerName: "Email", width: 200 },
    { field: "role", headerName: "Role", width: 130 },
  ];

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      pageSize={5}
      rowsPerPageOptions={[5]}
      checkboxSelection
      onRowSelectionModelChange={(newSelectionModel) => {
        setSelectedRows(newSelectionModel);
      }}
      selectionModel={selectedRows}
      getRowId={(row) => row._id}
    />
  );
};

export default UsersTable;
