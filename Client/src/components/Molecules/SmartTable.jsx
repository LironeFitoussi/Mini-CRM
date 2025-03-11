// src/components/Molecules/SmartTable.jsx
import { useState, useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@mui/material";
import NextContactDateModal from "../Modals/NextContactDateModal";
import StatusSelect from "../Atoms/StatusSelect";
import PropTypes from 'prop-types';
const SmartTable = ({
  data = [],
  loading = false,
  onStatusToggle,
  onRowClick,
  size = "100%",
  page,
  pageSize,
  totalDocuments,
  onPageChange,
  onPageSizeChange,
}) => {
  const { t } = useTranslation();
  SmartTable.propTypes = {
    data: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    onStatusToggle: PropTypes.func.isRequired,
    onRowClick: PropTypes.func,
    size: PropTypes.string,
    page: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    totalDocuments: PropTypes.number.isRequired,
    onPageChange: PropTypes.func,
    onPageSizeChange: PropTypes.func,
  };

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
      headerName: t("clientInfo.fName") || "First Name",
      flex: 1,
      renderCell: (params) =>
        loading ? <Skeleton variant="text" aria-hidden="true" /> : params.value || "N/A",
    },
    {
      field: "lName",
      headerName: t("clientInfo.lName") || "Last Name",
      flex: 1,
      renderCell: (params) =>
        loading ? <Skeleton variant="text" aria-hidden="true" /> : params.value || "N/A",
    },
    {
      field: "email",
      headerName: t("clientInfo.email") || "Email",
      flex: 2,
      renderCell: (params) =>
        loading ? <Skeleton variant="text" aria-hidden="true" /> : params.value || "N/A",
    },
    {
      field: "phoneNumber",
      headerName: t("clientInfo.phone") || "Phone",
      flex: 1,
      renderCell: (params) =>
        loading ? <Skeleton variant="text" aria-hidden="true" /> : params.value || "N/A",
    },
    {
      field: "status",
      headerName: t("customerManagement.status") || "Status",
      flex: 1,
      renderCell: (params) => {
        if (loading) {
          return <Skeleton variant="rectangular" width="80%" height={24} aria-hidden="true" />;
        }

        if (!params.row) return "N/A";

        return (
          <StatusSelect
            currentStatus={params.row.status}
            donatorId={params.row._id}
            onStatusToggle={onStatusToggle}
            onNeedDate={(donatorId) => handleOpenModal(donatorId)}
          />
        );
      },
    },
    {
      field: "nextContactDate",
      headerName: t("donatorNotes.nextContactDate") || "Next Contact",
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
      headerName: t("customerManagement.owner") || "Owner",
      flex: 1,
      renderCell: (params) => {
        if (loading) {
          return <Skeleton variant="text" aria-hidden="true" />;
        }

        return `${params.row.owner?.fName || ""} ${params.row.owner?.lName || "N/A"}`;
      },
    },
  ], [loading, onStatusToggle, t]);

  const getRowClassName = (params) => {
    const status = params.row.status;
    if (status === "Done") return "row-done";
    if (status === "To Validate") return "row-to-validate";
    return "";
  };

  const handleRowClick = (params) => {
    if (onRowClick) {
      onRowClick(params.row._id);
    }
  };

  const handlePaginationModelChange = (model) => {
    if (onPageChange && model.page !== page) {
      onPageChange(model.page);
    }
    if (onPageSizeChange && model.pageSize !== pageSize) {
      onPageSizeChange(model.pageSize);
    }
  };

  return (
    <>
      <div style={{ height: 600, width: size }}>
        {loading ? (
          <Skeleton variant="rectangular" height={600} />
        ) : (
          <DataGrid
            rows={data}
            columns={columns}
            getRowId={(row) => row._id}
            rowCount={totalDocuments}
            pageSizeOptions={[10, 25, 50, 100]}
            paginationModel={{ page, pageSize }}
            onPaginationModelChange={handlePaginationModelChange}
            paginationMode="server"
            onRowClick={handleRowClick}
            getRowClassName={getRowClassName}
            disableRowSelectionOnClick
            autoHeight
          />
        )}
      </div>
      <NextContactDateModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onDateSelect={handleDateSelect}
      />
    </>
  );
};

export default SmartTable;
