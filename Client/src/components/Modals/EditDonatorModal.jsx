import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Modal,
  Alert,
  IconButton,
  Stack,
} from "@mui/material";
import { DateField } from "@mui/x-date-pickers";
import { CalendarToday } from "@mui/icons-material";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Add, Remove } from "@mui/icons-material";

const EditDonatorModal = ({
  open,
  onClose,
  handleEditDonator,
  donatorData,
}) => {
  const [fName, setFName] = useState(donatorData?.fName || "");
  const [lName, setLName] = useState(donatorData?.lName || "");
  const [birthdate, setBirthdate] = useState(donatorData?.birthdate || "");
  const [error, setError] = useState("");
  const [alloDonId, setAlloDonId] = useState(donatorData?.allo_dons_id || "");

  const [donatorEmail, setDonatorEmail] = useState([
    donatorData?.email_1 || { email: "", isSubscribed: true },
    donatorData?.email_2 || { email: "", isSubscribed: true },
    donatorData?.email_3 || { email: "", isSubscribed: true },
  ]);

  const [donatorPhone, setDonatorPhone] = useState([
    donatorData?.phone_number_1 || {
      number: "",
      country: "il",
      isSubscribed: true,
    },
    donatorData?.phone_number_2 || {
      number: "",
      country: "il",
      isSubscribed: true,
    },
    donatorData?.phone_number_3 || {
      number: "",
      country: "il",
      isSubscribed: true,
    },
  ]);

  // Handle Email Change
  const handleEmailChange = (index, key, value) => {
    const updatedEmails = [...donatorEmail];
    updatedEmails[index][key] = value;
    setDonatorEmail(updatedEmails);
  };

  // Handle Phone Change
  const handlePhoneChange = (index, key, value) => {
    const updatedPhones = [...donatorPhone];
    updatedPhones[index][key] = value;
    setDonatorPhone(updatedPhones);
  };

  // Add Email Field
  const addEmailField = () => {
    if (donatorEmail.length < 3) {
      setDonatorEmail([...donatorEmail, { email: "", isSubscribed: false }]);
    }
  };

  // Add Phone Field
  const addPhoneField = () => {
    if (donatorPhone.length < 3) {
      setDonatorPhone([
        ...donatorPhone,
        { number: "", country: "il", isSubscribed: false },
      ]);
    }
  };

  // Remove Email Field
  const removeEmailField = (index) => {
    const updatedEmails = donatorEmail.filter((_, i) => i !== index);
    setDonatorEmail(updatedEmails);
  };

  // Remove Phone Field
  const removePhoneField = (index) => {
    const updatedPhones = donatorPhone.filter((_, i) => i !== index);
    setDonatorPhone(updatedPhones);
  };

  // Submit Handler
  const handleSubmit = () => {
    if (!fName || !lName) {
      setError(
        "First Name, Last Name, and at least one valid phone number are required."
      );
      return;
    }

    handleEditDonator({
      fName,
      lName,
      birthdate,
      allo_dons_id: alloDonId,
      email_1: donatorEmail[0],
      email_2: donatorEmail[1],
      email_3: donatorEmail[2],
      phone_number_1: donatorPhone[0],
      phone_number_2: donatorPhone[1],
      phone_number_3: donatorPhone[2],
    });
    onClose();
  };

  // Format YYYY-MM-DD to DD/MM/YYYY
  const formatDate = (date) => {
    if (!date) return "";
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

  // Parse DD/MM/YYYY back to YYYY-MM-DD
  const parseDate = (formattedDate) => {
    if (!formattedDate) return "";
    const [day, month, year] = formattedDate.split("/");
    return `${year}-${month}-${day}`;
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          bgcolor: "background.paper",
          border: "1px solid #ddd",
          boxShadow: 24,
          borderRadius: 2,
          p: 4,
        }}
      >
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Edit Donator
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          margin="normal"
          fullWidth
          label="First Name"
          value={fName}
          onChange={(e) => setFName(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          margin="normal"
          fullWidth
          label="Last Name"
          value={lName}
          onChange={(e) => setLName(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        <DateField
          label="Birthdate"
          value={birthdate ? new Date(birthdate) : null}
          onChange={(newValue) =>
            setBirthdate(newValue ? newValue.toISOString().split("T")[0] : "")
          }
          format="dd/MM/yyyy"
          slots={{
            openPickerIcon: CalendarToday, // Add a calendar button
          }}
          sx={{ mb: 2 }}
          fullWidth
          required
        />

        {/* Email Section */}
        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
          Emails
        </Typography>
        {donatorEmail.map((email, index) => (
          <Stack
            key={index}
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ mb: 1 }}
          >
            <TextField
              fullWidth
              label={`Email ${index + 1}`}
              value={email.email}
              onChange={(e) =>
                handleEmailChange(index, "email", e.target.value)
              }
            />
            <IconButton
              color="error"
              onClick={() => removeEmailField(index)}
              disabled={donatorEmail.length === 1}
            >
              <Remove />
            </IconButton>
          </Stack>
        ))}
        {donatorEmail.length < 3 && (
          <Button startIcon={<Add />} onClick={addEmailField} sx={{ mt: 1 }}>
            Add Email
          </Button>
        )}

        {/* Phone Section */}
        <Typography variant="subtitle1" sx={{ mt: 4, mb: 1 }}>
          Phone Numbers
        </Typography>
        {donatorPhone.map((phone, index) => (
          <Stack
            key={index}
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ mb: 1 }}
          >
            <PhoneInput
              country={phone.country}
              value={phone.number}
              onChange={(value, countryData) =>
                handlePhoneChange(index, "number", `+${value}`, countryData)
              }
              containerStyle={{ flex: 1 }}
              inputStyle={{ width: "100%" }}
            />
            <IconButton
              color="error"
              onClick={() => removePhoneField(index)}
              disabled={donatorPhone.length === 1}
            >
              <Remove />
            </IconButton>
          </Stack>
        ))}
        {donatorPhone.length < 3 && (
          <Button startIcon={<Add />} onClick={addPhoneField} sx={{ mt: 1 }}>
            Add Phone
          </Button>
        )}

        <TextField
          margin="normal"
          fullWidth
          label="Allodon ID"
          value={alloDonId}
          onChange={(e) => setAlloDonId(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          sx={{ mt: 4 }}
        >
          Save Changes
        </Button>
      </Box>
    </Modal>
  );
};

export default EditDonatorModal;
