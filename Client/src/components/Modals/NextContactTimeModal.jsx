import React, { useState } from "react";
import {
  Modal,
  Box,
  Button,
  Typography,
  TextField,
  Stack,
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

const NextContactTimeModal = ({
  isOpen,
  onClose,
  predefinedDate, // Expected to be an ISO string or Date object
  onTimeSelect,
}) => {
  const { t } = useTranslation();

  // State to manage selected time
  const [selectedTime, setSelectedTime] = useState(null);

  // Define fixed hour options
  const fixedHours = [
    { label: t("NextContactTimeModal.times.9am"), value: 9 },
    { label: t("NextContactTimeModal.times.12pm"), value: 12 },
    { label: t("NextContactTimeModal.times.3pm"), value: 15 },
    { label: t("NextContactTimeModal.times.6pm"), value: 18 },
    { label: t("NextContactTimeModal.times.9pm"), value: 21 },
  ];

  const handleFixedHourSelect = (hour) => {
    const updatedDate = dayjs(predefinedDate)
      .hour(hour)
      .minute(0)
      .second(0)
      .millisecond(0);
    onTimeSelect(updatedDate.toISOString());
    handleClose();
  };

  const handleCustomTimeChange = (newValue) => {
    setSelectedTime(newValue);
  };

  const handleCustomTimeSubmit = () => {
    if (selectedTime) {
      const updatedDate = dayjs(predefinedDate)
        .hour(selectedTime.hour())
        .minute(selectedTime.minute())
        .second(0)
        .millisecond(0);
      onTimeSelect(updatedDate.toISOString());
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedTime(null);
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby={t("NextContactTimeModal.aria.setNextContactTime")}
      aria-describedby={t("NextContactTimeModal.aria.modalDescription")}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography
          id="set-next-contact-time"
          variant="h6"
          component="h2"
          gutterBottom
        >
          {t("NextContactTimeModal.title")}
        </Typography>
        <Stack spacing={2}>
          <Typography variant="subtitle1">
            {t("NextContactTimeModal.fixedTime")}
          </Typography>
          <Stack direction="row" spacing={1}>
            {fixedHours.map((option) => (
              <Button
                key={option.value}
                variant="outlined"
                onClick={() => handleFixedHourSelect(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </Stack>

          <Typography variant="subtitle1" mt={2}>
            {t("NextContactTimeModal.customTime")}
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
              label={t("NextContactTimeModal.selectTime")}
              value={selectedTime}
              onChange={handleCustomTimeChange}
              renderInput={(params) => <TextField {...params} />}
              ampm={false} // Use 24-hour format; set to true for 12-hour
            />
          </LocalizationProvider>
          <Button
            variant="contained"
            onClick={handleCustomTimeSubmit}
            disabled={!selectedTime}
          >
            {t("NextContactTimeModal.setCustomTime")}
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default NextContactTimeModal;
