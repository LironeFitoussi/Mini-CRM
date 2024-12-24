import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import SmsIcon from "@mui/icons-material/Sms";

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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Keep the same import
import EmailModal from "../../../components/Modals/EmailModal";

// Components
import DonatorTasks from "../../../components/Molecules/DonatorTasks";

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
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ======= Email Modal State =======
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  // Form values to pass into EmailModal > EmailForm
  const [formValues, setFormValues] = useState({
    from: "contact.lesenfantsderachi@gmail.com",
    to: client?.email_1 || "",
    subject: "",
    body: "",
    imagePosition: "top",
    imageUrl: null,
  });

  // Example: track changes from the child form
  const handleEmailChange = (fieldName, newValue) => {
    console.log("Field changed:", fieldName, newValue);
    
    setFormValues((prev) => ({ ...prev, [fieldName]: newValue }));
  };

  // Example: handle the final "Send" button in the modal
  const handleEmailSubmit = async (values) => {
    try {
      // Mock an API request or real integration
      console.log("Sending email with values:", values);
      alert("Email sent successfully!");
      setEmailModalOpen(false);
    } catch (err) {
      console.error("Failed to send email:", err);
      alert("Failed to send email.");
    }
  };

  // ======= Fetch client & donations =======
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/v1/donators/${id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch client data");
        }
        const data = await response.json();
        setClient(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // ======= Loading & Error states =======
  if (loading) {
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
          {error}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/dashboard/clients")}
        >
          Back to Clients
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
          Back to Clients
        </Button>
      </Box>
    );
  }

  // ======= Destructure client data =======
  const {
    fName,
    lName,
    email_1,
    phone_number_1,
    donations = [],
  } = client;

  // ======= Donations analytics =======
  const groupedDonations = donations.reduce((acc, donation) => {
    const { currency, amount } = donation;
    if (!acc[currency]) acc[currency] = 0;
    acc[currency] += amount;
    return acc;
  }, {});

  const currencyIcons = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    NIS: "₪",
  };

  const donationTypes = [
    {
      name: "Don spontané",
      value: donations.filter((d) => d.type === "Don spontané").length,
    },
    {
      name: "Aide au hayalim",
      value: donations.filter((d) => d.type === "Aide au hayalim").length,
    },
    {
      name: "Mikvé",
      value: donations.filter((d) => d.type === "Mikvé").length,
    },
    {
      name: "Aide aux Nécessiteux",
      value: donations.filter((d) => d.type === "Aide aux Nécessiteux").length,
    },
    {
      name: "Pessah",
      value: donations.filter((d) => d.type === "Pessah").length,
    },
    {
      name: "HANOUCA HAYALIM & YELADIM",
      value: donations.filter((d) => d.type === "HANOUCA HAYALIM & YELADIM")
        .length,
    },
    {
      name: "Pourim",
      value: donations.filter((d) => d.type === "Pourim").length,
    },
    {
      name: "kapparot",
      value: donations.filter((d) => d.type === "kapparot").length,
    },
    {
      name: "DBI",
      value: donations.filter((d) => d.type === "DBI").length,
    },
    {
      name: "merci",
      value: donations.filter((d) => d.type === "merci").length,
    },
    {
      name: "Ahdoute",
      value: donations.filter((d) => d.type === "Ahdoute").length,
    },
  ];

  return (
    <Box sx={{ padding: 4 }}>
      {/* ========== Client Info ========== */}
      <Paper sx={{ padding: 3, marginBottom: 3, boxShadow: 3 }}>
        <Typography variant="h4" gutterBottom>
          {fName} {lName}
        </Typography>
        <Divider sx={{ marginY: 2 }} />
        <Box sx={{ display: "flex", gap: 4, justifyContent: "space-between" }}>
          <Box>
            <Typography variant="body1">
              <strong>Email:</strong> {email_1 || "N/A"}
            </Typography>
            <Typography variant="body1">
              <strong>Phone:</strong> {phone_number_1?.number || "N/A"}
            </Typography>
          </Box>

          <Box>
            {/* ========== Contact Icons ========== */}
            <Button
              sx={{
                marginRight: 2,
                backgroundColor: "#FFBF00",
                color: "white",
              }}
              color="primary"
              startIcon={<MailOutlineIcon />}
              // Open the Email Modal
              onClick={() => {
                setFormValues((prev) => ({ ...prev, to: email_1 || "" }));
                email_1 && setEmailModalOpen(true);
                !email_1 && alert("No email address found.");
              }}
            >
              Email
            </Button>

            <Button
              variant="contained"
              startIcon={<WhatsAppIcon />}
              sx={{
                marginRight: 2,
                backgroundColor: "#25D366",
                color: "white",
              }}
            >
              WhatsApp
            </Button>

            <Button
              variant="contained"
              startIcon={<SmsIcon />}
              sx={{
                backgroundColor: "#0088FE",
                color: "white",
              }}
            >
              SMS
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* ========== Analytics ========== */}
      <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap", mt: 4 }}>
        <Paper sx={{ flex: 1, p: 2, boxShadow: 3 }}>
          <Typography variant="h6">Total Donations</Typography>
          {Object.entries(groupedDonations).map(([currency, total]) => (
            <Typography key={currency} variant="h5" sx={{ color: "primary.main" }}>
              {currency} {currencyIcons[currency]}: {total}
            </Typography>
          ))}
        </Paper>

        <Paper sx={{ flex: 1, p: 2, boxShadow: 3 }}>
          <Typography variant="h6">Donation Types</Typography>
          <ResponsiveContainer width="100%" height={200}>
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
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>

        <Paper sx={{ flex: 1, p: 2, boxShadow: 3 }}>
          <Typography variant="h6">Donations Over Time</Typography>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={donations}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {/* ========== Donation History Table ========== */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Donation History
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Amount</TableCell>
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

        <DonatorTasks donatorId={id} />
      </Box>

      {/* ========== Back to Clients ========== */}
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 3 }}
        onClick={() => navigate("/dashboard/clients")}
      >
        Back to Clients
      </Button>

      {/* ========== Email Modal ========== */}
      <EmailModal
        // IMPORTANT: rename from `isOpen` to `open`
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
