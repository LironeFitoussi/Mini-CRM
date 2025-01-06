import React, { useState } from "react";
import { Select, MenuItem } from "@mui/material";
import { useTranslation } from "react-i18next";

import NextContactDateModal from "../Modals/NextContactDateModal";
import { useUpdateDonatorCallbackDate } from "../../queryhooks/useUpdateDonatorCallbackDate";
import { useUpdateDonatorStatus } from "../../queryhooks/useUpdateDonatorStatus";

const StatusSelect = ({
  currentStatus = "",
  donatorId,
  page = 0,
  pageSize = 10,
  search = "",
}) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState(currentStatus);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // React Query mutation for updating status
  const { mutate: updateStatus } = useUpdateDonatorStatus({
    page,
    pageSize,
    search,
  });

  // React Query mutation for updating callback date
  const { mutate: updateCallbackDate } = useUpdateDonatorCallbackDate({
    page,
    pageSize,
    search,
  });

  // -- NextContactDateModal logic --
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleDateSelect = (isoDate) => {
    updateCallbackDate({ donorId: donatorId, nextContactDate: isoDate });
    handleCloseModal();
  };

  // -- Status Dropdown onChange --
  const handleChange = (event) => {
    const newStatus = event.target.value;
    setStatus(newStatus);

    // 1) Call the backend to update status
    updateStatus({ donorId: donatorId, newStatus });

    // 2) Open NextContactDateModal if status requires scheduling a callback
    // if (
    //   newStatus === "To Call Back" ||
    //   newStatus === "To Validate" ||
    //   newStatus === "No Response"
    // ) {
    //   handleOpenModal();
    // }
  };

  // We define our status options, mapping each "value" to its i18n label
  const statusOptions = [
    { value: "To Contact",     label: t("menuItems.toContact") },
    { value: "No Response",    label: t("menuItems.noResponse") },
    { value: "To Call Back",   label: t("menuItems.toCallBack") },
    { value: "Not Interested", label: t("menuItems.notInterested") },
    { value: "To Validate",    label: t("menuItems.toValidate") },
    { value: "Done",           label: t("menuItems.done") },
  ];

  return (
    <>
      <Select
        variant="outlined"
        size="small"
        value={status}
        onChange={handleChange}
      >
        {statusOptions.map(({ value, label }) => (
          <MenuItem key={value} value={value}>
            {label}
          </MenuItem>
        ))}
      </Select>

      {/* NextContactDateModal -> same one you’re using elsewhere */}
      <NextContactDateModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onDateSelect={handleDateSelect}
      />
    </>
  );
};

export default StatusSelect;
