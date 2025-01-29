// src/components/Molecules/SmartTable.jsx
import React, { useState, useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@mui/material";
import NextContactDateModal from "../Modals/NextContactDateModal";
import StatusSelect from "../Atoms/StatusSelect";

const SmartTable = ({
  data = [],
  loading = false,
  onStatusToggle,
  onDonatorSelect,
  size = "100%",
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onPageSizeChange,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // console.log(data);
  
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
    onStatusToggle(selectedDonatorId, { nextContactDate: isoDate });
    handleCloseModal();
  };

  // Define columns
  const columns = useMemo(() => [
    {
      field: "fName",
      headerName: t("clientInfo.fName"),
      flex: 1,
      renderCell: (params) =>
        loading ? <Skeleton variant="text" aria-hidden="true" /> : params.value || "N/A",
    },
    {
      field: "lName",
      headerName: t("clientInfo.lName"),
      flex: 1,
      renderCell: (params) =>
        loading ? <Skeleton variant="text" aria-hidden="true" /> : params.value || "N/A",
    },
    {
      field: "email",
      headerName: t("clientInfo.email"),
      flex: 2,
      renderCell: (params) =>
        loading ? <Skeleton variant="text" aria-hidden="true" /> : params.value || "N/A",
    },
    {
      field: "phoneNumber",
      headerName: t("clientInfo.phone"),
      flex: 1,
      renderCell: (params) =>
        loading ? <Skeleton variant="text" aria-hidden="true" /> : params.value || "N/A",
    },
    {
      field: "status",
      headerName: t("customerManagement.status"),
      flex: 1,
      renderCell: (params) => {
        if (loading) {
          return <Skeleton variant="rectangular" width="80%" height={24} aria-hidden="true" />;
        }

        if (!params.row) return "N/A";

        return (
          <StatusSelect
            currentStatus={params.row.status}
            donatorId={params.row.id}
            onStatusToggle={onStatusToggle}
            onNeedDate={(donatorId) => handleOpenModal(donatorId)}
          />
        );
      },
    },
    {
      field: "nextContactDate",
      headerName: t("donatorNotes.nextContactDate"),
      flex: 1,
      renderCell: (params) => {
        if (loading) {
          return <Skeleton variant="text" aria-hidden="true" />;
        }

        if (!params.row?.nextContactDate) return "N/A";
        const dateObj = new Date(params.row.nextContactDate);
        const formattedDate = dateObj.toLocaleString("en-GB", {
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
    {
      field: "owner",
      headerName: t("customerManagement.owner"),
      flex: 1,
      renderCell: (params) => {
        if (loading) {
          return <Skeleton variant="text" aria-hidden="true" />;
        }

        return `${params.row.owner?.fName || ""} ${params.row.owner?.lName || "N/A"}`;
      },
    },
  ], [loading, onStatusToggle]);

  // Convert your data => DataGrid-friendly rows
  const rows = useMemo(() => data.map((donor) => ({
    id: donor._id,
    fName: donor.fName || "",
    lName: donor.lName || "",
    email: donor.email_1?.email || "N/A",
    phoneNumber: donor.phone_number_1?.number || "N/A",
    status: donor.status || "",
    nextContactDate: donor.nextContactDate || null,
    owner: donor.owner || null,
  })), [data]);

  const getRowClassName = (params) => {
    const status = params.row.status;
    if (status === "Done") return "row-done";
    if (status === "To Validate") return "row-to-validate";
    return "";
  };

  // Handle row click -> navigate to /donors/:id
  const handleRowClick = (params) => {
    if (loading) return; // Prevent navigation when loading
    navigate(`/dashboard/donors/${params.id}`);
  };

  // Handle pagination model change
  const handlePaginationModelChange = (model) => {
    const { page: newPage, pageSize: newPageSize } = model;

    if (newPage !== page && typeof onPageChange === "function") {
      onPageChange(newPage);
    }

    if (newPageSize !== rowsPerPage && typeof onPageSizeChange === "function") {
      onPageSizeChange(newPageSize);
    }
  };

  return (
    <div style={{ width: size }}>
      <DataGrid
        sx={{
          "& .MuiDataGrid-row:hover": {
            cursor: loading ? "default" : "pointer",
          },
          height: "72.5vh",
        }}
        rows={rows}
        columns={columns}
        loading={false} // Disable the default loading overlay
        getRowClassName={getRowClassName}
        pagination
        paginationMode="server"
        rowCount={totalCount}
        paginationModel={{ page, pageSize: rowsPerPage }}
        onPaginationModelChange={handlePaginationModelChange}
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
