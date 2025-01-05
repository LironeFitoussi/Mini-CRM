// src/components/SmartTable.jsx (or wherever)

import React, { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import NextContactDateModal from "../Modals/NextContactDateModal";

// 1) If you have a callback-date mutation:
import { useUpdateDonatorCallbackDate } from "../../queryhooks/useUpdateDonatorCallbackDate";

// 2) Import your StatusSelect
import StatusSelect from "../Atoms/StatusSelect";

const SmartTable = ({
  data = [],
  loading = false,
  onStatusToggle, // maybe you have a parent callback
  size = "100%",
  page,
  rowsPerPage,
  totalCount,
  setPage,
  setRowsPerPage,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Example search param
  const search = "";

  // Callback-date mutation (optional)
  const { mutate: updateCallbackDate } = useUpdateDonatorCallbackDate({
    page,
    pageSize: rowsPerPage,
    search,
  });

  // State + Modal for next contact date
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDonatorId, setSelectedDonatorId] = useState(null);

  const handleOpenModal = (donatorId) => {
    setSelectedDonatorId(donatorId);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setSelectedDonatorId(null);
    setIsModalOpen(false);
  };

  // Called when user picks a date in the modal
  const handleDateSelect = (isoDate) => {
    if (!selectedDonatorId) return;
    updateCallbackDate({ donorId: selectedDonatorId, nextContactDate: isoDate });
    handleCloseModal();
  };

  // Define columns
  const columns = [
    {
      field: "fName",
      headerName: t("clientInfo.fName"),
      flex: 1,
    },
    {
      field: "lName",
      headerName: t("clientInfo.lName"),
      flex: 1,
    },
    {
      field: "email",
      headerName: t("clientInfo.email"),
      flex: 2,
    },
    {
      field: "phoneNumber",
      headerName: t("clientInfo.phone"),
      flex: 1,
    },
    {
      field: "status",
      headerName: t("customerManagement.status"),
      flex: 1,
      renderCell: (params) => {
        if (!params.row) return "N/A";

        return (
          <StatusSelect
            currentStatus={params.row.status}
            donatorId={params.row.id}
            page={page}
            pageSize={rowsPerPage}
            search={search}
            // If you want the table to do the actual status mutation:
            onStatusToggle={(donatorId, newStatus) => {
              // e.g. call parent’s prop or do a local mutation here
              if (onStatusToggle) onStatusToggle(donatorId, newStatus);
            }}
            // Let the StatusSelect tell us if the user needs to schedule a next contact date
            onNeedDate={(donatorId) => handleOpenModal(donatorId)}
          />
        );
      },
    },
    {
      field: "nextContactDate",
      headerName: t("customerManagement.contactBackDate"),
      flex: 1,
      renderCell: (params) => {
        if (!params.row?.nextContactDate) return "N/A";
        const dateObj = new Date(params.row.nextContactDate);
        const formattedDate = dateObj.toLocaleString(undefined, {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        return formattedDate;
      },
    },
    // Owner column
    {
      field: "owner",
      headerName: t("customerManagement.owner"),
      flex: 1,
      renderCell: (params) => {
        return `${params.row.owner?.fName || ""} ${params.row.owner?.lName || "N/A"}`;
      },
    },

  ];

  // Convert your data => DataGrid-friendly rows
  const rows = data.map((donor) => ({
    id: donor._id,
    fName: donor.fName || "",
    lName: donor.lName || "",
    email: donor.email_1?.email || "N/A",
    phoneNumber: donor.phone_number_1?.number || "N/A",
    status: donor.status || "",
    nextContactDate: donor.nextContactDate || null,
    owner: donor.owner || null,
  }));

  const getRowClassName = (params) => {
    const status = params.row.status;
    if (status === "Done") return "row-done";
    if (status === "To Validate") return "row-to-validate";
    return "";
  };

  // Handle row click -> navigate to /donators/:id
  const handleRowClick = (params) => {
    navigate(`/dashboard/donators/${params.id}`);
  };

  return (
    <div style={{ width: size }}>
      <DataGrid
        sx={{
          "& .MuiDataGrid-row:hover": {
            cursor: "pointer",
          },
          height: "72.5vh",
        }}
        rows={rows}
        columns={columns}
        loading={loading}
        getRowClassName={getRowClassName}
        pagination
        paginationMode="server"
        rowCount={totalCount}
        paginationModel={{ page, pageSize: rowsPerPage }}
        onPaginationModelChange={(model) => {
          setPage(model.page);
          setRowsPerPage(model.pageSize);
        }}
        rowsPerPageOptions={[5, 10, 25, 50]}
        disableSelectionOnClick
        onRowClick={handleRowClick}
      />

      {/* Modal for scheduling next contact date */}
      <NextContactDateModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onDateSelect={handleDateSelect}
      />
    </div>
  );
};

export default SmartTable;
