// UsersTable.js
import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
const UsersTable = ({ rows, selectedRows, setSelectedRows }) => {
  const { t } = useTranslation();
  const columns = [
    { field: "_id", headerName: "ID", flex: 1 },
    {
      field: "fName",
      headerName: t("clientInfo.fName"),
      flex: 1
    },
    {
      field: "lName",
      headerName: t("clientInfo.lName"),
      flex: 1
    },
    { field: "email", headerName: t("clientInfo.email"), flex: 1 },
    { field: "role", headerName: t("clientInfo.role"), flex: 1 },
  ];

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      pageSize={4}
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
