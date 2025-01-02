import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDonator } from "../../../queryhooks/useDonator";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import SmsIcon from "@mui/icons-material/Sms";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import EditDonatorButton from "../../../components/Buttons/EditDonatorButton";
import { useTranslation } from "react-i18next";
// MUI Components
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts";

// Components
import DeleteDonatorButton from "../../../components/Atoms/DeleteDonatorButton";
import TaskCalendar from "../../../components/TaskCalendar";
import EmailModal from "../../../components/Modals/EmailModal";
import SendEmailButton from "../../../components/Atoms/SendEmailButton";
import DonatorNotes from "../../../components/Molecules/DonatorNotes";
import { getDonationTypes } from "../../../utils";
import SendWhatsappButton from "../../../components/Buttons/SendWhatsappButton";
import AddToLeadButton from "../../../components/Buttons/AddToLeadButton";

// Redux
import { useSelector } from "react-redux";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#d3d3d3",
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
];

const ClientDetailsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  // Get User Data
  const {user} = useSelector((state) => state.user);
  console.log("User Data: ", user);
  

  const { data: client, isLoading, error } = useDonator(id);

  // Email Modal State
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  const [formValues, setFormValues] = useState({
    from: "contact.lesenfantsderachi@gmail.com",
    to: client?.email_1?.email || "",
    subject: "",
    body: "",
    imagePosition: "top",
    imageUrl: null,
  });

  const handleEmailChange = (fieldName, newValue) => {
    setFormValues((prev) => ({ ...prev, [fieldName]: newValue }));
  };

  const handleEmailSubmit = async (values) => {
    try {
      alert("Email sent successfully!");
      setEmailModalOpen(false);
    } catch (err) {
      console.error("Failed to send email:", err);
      alert("Failed to send email.");
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ padding: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" mt={2}>
          Loading client data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: 4, textAlign: "center" }}>
        <Typography variant="h4" color="error" gutterBottom>
          {error.message}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/dashboard/clients")}
        >
          {t("actions.backToDonors")}
        </Button>
      </Box>
    );
  }

  if (!client) {
    return (
      <Box sx={{ padding: 4, textAlign: "center" }}>
        <Typography variant="h4" color="error" gutterBottom>
          Client Not Found
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/dashboard/clients")}
        >
          {t("actions.backToDonors")}
        </Button>
      </Box>
    );
  }

  const {
    fName,
    lName,
    email_1,
    phone_number_1,
    birthdate,
    donations = [],
  } = client;

  const groupedDonations = donations.reduce((acc, donation) => {
    const { currency, amount } = donation;
    if (!acc[currency]) acc[currency] = 0;
    acc[currency] += amount;
    return acc;
  }, {});

  const donationTypes = getDonationTypes(donations);

  const currencyIcons = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    NIS: "₪",
  };
  // ======= Render UI =======
  return (
    <Box sx={{ padding: 4 }}>
      {/* ========== Main Info & Chart (Side by Side but separate Papers) ========== */}
      <Box sx={{ display: "flex", gap: 2, marginBottom: 3 }}>
        {/* ---------- Left Paper: Client Info ---------- */}
        <Paper sx={{ flex: 1, boxShadow: 3 }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom className="flex justify-between">
              {fName} {lName} {!fName && !lName && "This client has no name."}
              <Box>
                <EditDonatorButton donatorData={client} />
                { (user.role === "developer" || user.role === "admin") && <AddToLeadButton selectedDonorIds={[id]} />}
              </Box>
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Email:</strong> {email_1?.email || "N/A"}
            </Typography>
            {client?.email_2?.email && (
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Email 2:</strong>
                {client.email_2?.email || "N/A"}
              </Typography>
            )}
            {client?.email_3?.email && (
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Email 3:</strong>
                {client.email_3?.email || "N/A"}
              </Typography>
            )}
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>
                {t("customerManagement.phone")} 1:
                </strong> {phone_number_1?.number || "N/A"}
            </Typography>
            {client?.phone_number_2?.number && (
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>
                  {t("customerManagement.phone")} 2:</strong>
                {client.phone_number_2?.number || "N/A"}
              </Typography>
            )}
            {client?.phone_number_3?.number && (
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>
                  {t("customerManagement.phone")} 3:
                  </strong>
                {client.phone_number_3?.number || "N/A"}
              </Typography>
            )}

            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>
                {t("contactsManagement.birthDate")}:
                </strong>{" "}
              {birthdate
                ? new Date(birthdate).toLocaleDateString("en-GB")
                : "N/A"}
            </Typography>

            {/* ========== Contact Buttons ========== */}
            <Box sx={{ display: "flex", gap: 1 }}>
              <SendEmailButton recipient={email_1?.email} />

              <SendWhatsappButton recipientPhone={phone_number_1?.number} />

              <Button
                variant="contained"
                startIcon={<SmsIcon />}
                sx={{
                  backgroundColor: "#0088FE",
                  color: "white",
                  ":hover": { backgroundColor: "#0077e4" },
                }}
              >
                SMS
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* ---------- Right Paper: Donation Chart ---------- */}
        <Paper sx={{ flex: 1, boxShadow: 3 }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t("general.totalDonations")}
            </Typography>
            {Object.entries(groupedDonations).map(([currency, total]) => (
              <Typography
                key={currency}
                variant="h5"
                sx={{ color: "primary.main" }}
              >
                {currency} {currencyIcons[currency]}: {total}
              </Typography>
            ))}

            <Box sx={{ width: "100%", height: 200, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donationTypes}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                  >
                    {donationTypes.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* ========== Donator Notes ========== */}
      <Paper sx={{ p: 2, boxShadow: 3, mb: 3 }}>
        <DonatorNotes donatorId={id} note={client.notes} />
      </Paper>

      {/* ========== Donation History Table ========== */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {t("general.donationsHistory")}
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  {t("general.date")}
                  </TableCell>
                <TableCell>
                  {t("donations.amount")}
                  </TableCell>
                <TableCell>Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {donations.map((donation) => (
                <TableRow key={donation._id}>
                  <TableCell>{donation.date}</TableCell>
                  <TableCell>${donation.amount}</TableCell>
                  <TableCell>{donation.type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* ========== Donator Tasks ==========
      <Box sx={{ mb: 4 }}>
        <DonatorTasks donatorId={id} />
      </Box> */}

      {/* ========== Task Calendar ========== */}
      <Box sx={{ mb: 4 }}>
        <TaskCalendar />
      </Box>

      {/* ========== Footer: Back & Delete ========== */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 4,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/dashboard/donators")}
          sx={{ display: "flex", gap: 1 }}
        >
          <ArrowCircleLeftIcon /> {t("actions.backToDonors")}
        </Button>
        <DeleteDonatorButton donatorData={client} />
      </Box>

      {/* ========== Email Modal ========== */}
      <EmailModal
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        formValues={formValues}
        handleChange={handleEmailChange}
        handleSubmit={handleEmailSubmit}
      />
    </Box>
  );
};

export default ClientDetailsPage;
