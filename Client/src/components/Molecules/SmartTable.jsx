import React, { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Select, MenuItem, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom"; // <-- import useNavigate
import NextContactDateModal from "../Modals/NextContactDateModal";

// 1) Import the new React Query mutation hook
import { useUpdateDonatorCallbackDate } from "../../queryhooks/useUpdateDonatorCallbackDate";

const SmartTable = ({
  data = [],
  loading = false,
  onStatusToggle,
  size = "100%",
  page,
  rowsPerPage,
  totalCount,
  setPage,
  setRowsPerPage,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // If you have a search param, pass it here too. For example:
  const search = "";

  // 2) Initialize the mutation
  const { mutate: updateCallbackDate } = useUpdateDonatorCallbackDate({
    page,
    pageSize: rowsPerPage,
    search,
  });

  // State + Modal for callback date
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

  // 3) Instead of axios directly, call the mutation
  const handleDateSelect = (isoDate) => {
    if (!selectedDonatorId) return;

    updateCallbackDate({
      donorId: selectedDonatorId,
      nextContactDate: isoDate,
    });

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
        const currentStatus = params.row.status || "";

        const handleChange = (event) => {
          const newStatus = event.target.value;
          // Example of showing modal if certain statuses are selected
          if (
            newStatus === "To Call Back" ||
            newStatus === "To Validate" ||
            newStatus === "No Response"
          ) {
            handleOpenModal(params.row.id);
          }
          onStatusToggle && onStatusToggle(params.row.id, newStatus);
        };

        // Prevent row click from firing when user interacts with the select
        const handleClick = (e) => {
          e.stopPropagation();
        };

        return (
          <Select
            value={currentStatus}
            onChange={handleChange}
            onClick={handleClick} // stops row click
            variant="outlined"
            size="small"
            fullWidth
          >
            <MenuItem value="To Contact">{t("menuItems.toContact")}</MenuItem>
            <MenuItem value="No Response">{t("menuItems.noResponse")}</MenuItem>
            <MenuItem value="To Call Back">
              {t("menuItems.toCallBack")}
            </MenuItem>
            <MenuItem value="Not Interested">
              {t("menuItems.notInterested")}
            </MenuItem>
            <MenuItem value="To Validate">{t("menuItems.toValidate")}</MenuItem>
            <MenuItem value="Done">{t("menuItems.done")}</MenuItem>
          </Select>
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
        return formattedDate
      },
    },
  ];

  // MUI DataGrid requires an array of objects with `id`
  const rows = data.map((donor) => ({
    id: donor._id,
    fName: donor.fName || "",
    lName: donor.lName || "",
    email: donor.email_1?.email || "N/A",
    phoneNumber: donor.phone_number_1?.number || "N/A",
    status: donor.status || "",
    nextContactDate: donor.nextContactDate || null,
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
        // Server-side pagination
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
        onRowClick={handleRowClick} // <-- use onRowClick
      />

      {/* Modal for date selection */}
      <NextContactDateModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onDateSelect={handleDateSelect}
      />
    </div>
  );
};

export default SmartTable;
