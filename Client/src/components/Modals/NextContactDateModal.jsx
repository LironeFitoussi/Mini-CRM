// NextContactDateModal.jsx
import { useState } from "react";
import {
  Modal,
  Box,
  Button,
  Typography,
  TextField,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import PropTypes from 'prop-types';

const NextContactDateModal = ({
  isOpen,
  onClose,
  onDateSelect,
}) => {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState("");

  const handlePredefinedOption = (option) => {
    let newDate;
    const now = new Date();

    switch (option) {
      case "in1Hour":
        newDate = new Date(now.getTime() + 1 * 60 * 60 * 1000);
        break;
      case "in2Hours":
        newDate = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        break;
      case "thisAfternoon":
        newDate = new Date();
        newDate.setHours(15, 0, 0, 0); // 3 PM
        break;
      case "thisEvening":
        newDate = new Date();
        newDate.setHours(19, 0, 0, 0); // 7 PM
        break;
      case "nextWeek":
        newDate = new Date();
        newDate.setDate(now.getDate() + 7);
        break;
      default:
        newDate = null;
    }

    if (newDate) {
      onDateSelect(newDate.toISOString());
      handleClose();
    }
  };

  const handleCustomDate = () => {
    if (selectedDate) {
      onDateSelect(new Date(selectedDate).toISOString());
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedDate("");
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="set-next-contact-date"
      aria-describedby="modal-to-set-next-contact-date"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 320,
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography
          id="set-next-contact-date"
          variant="h6"
          component="h2"
          gutterBottom
        >
          {t("Set Next Contact Date")}
        </Typography>
        <Box display="flex" flexDirection="column" gap={2}>
          <Button
            variant="contained"
            onClick={() => handlePredefinedOption("in1Hour")}
          >
            {t("In 1 Hour")}
          </Button>
          <Button
            variant="contained"
            onClick={() => handlePredefinedOption("in2Hours")}
          >
            {t("In 2 Hours")}
          </Button>
          <Button
            variant="contained"
            onClick={() => handlePredefinedOption("thisAfternoon")}
          >
            {t("This Afternoon")}
          </Button>
          <Button
            variant="contained"
            onClick={() => handlePredefinedOption("thisEvening")}
          >
            {t("This Evening")}
          </Button>
          <Button
            variant="contained"
            onClick={() => handlePredefinedOption("nextWeek")}
          >
            {t("Next Week")}
          </Button>
          <Typography align="center">{t("OR")}</Typography>
          <TextField
            label={t("Custom Date & Time")}
            type="datetime-local"
            InputLabelProps={{
              shrink: true,
            }}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <Button
            variant="outlined"
            onClick={handleCustomDate}
            disabled={!selectedDate}
          >
            {t("Set Custom Date")}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

NextContactDateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDateSelect: PropTypes.func.isRequired,
};

export default NextContactDateModal;
