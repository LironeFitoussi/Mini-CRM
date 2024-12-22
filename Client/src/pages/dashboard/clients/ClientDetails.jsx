import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  CircularProgress
} from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#d3d3d3", "#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const ClientDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch client and donations from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/donators/${id}`);
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

  console.log(client);
  
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
        <Button variant="contained" color="primary" onClick={() => navigate("/dashboard/clients")}>
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
        <Button variant="contained" color="primary" onClick={() => navigate("/dashboard/clients")}>
          Back to Clients
        </Button>
      </Box>
    );
  }

  // console.log(client);
  const { fName, lName, company, email_1, phone_number_1, donations = [] } = client;

  // Calculate analytics
  const groupedDonations = donations.reduce((acc, donation) => {
    const { currency, amount } = donation;

    if (!acc[currency]) {
      acc[currency] = 0; // Initialize the currency sum
    }

    acc[currency] += amount; // Add the amount to the respective currency

    return acc;
  }, {});

  const currencyIcons = {
    USD: "$",
    EUR: "€",
    GBP: "£"
  };

  const donationTypes = [
    { name: "Don spontané", value: donations.filter((d) => d.type === "Don spontané").length },
    { name: "Aide au hayalim", value: donations.filter((d) => d.type === "Aide au hayalim").length },
    { name: "Mikvé", value: donations.filter((d) => d.type === "Mikvé").length },
    { name: "Aide aux Nécessiteux", value: donations.filter((d) => d.type === "Aide aux Nécessiteux").length },
    { name: "Pessah", value: donations.filter((d) => d.type === "Pessah").length },
    { name: "HANOUCA HAYALIM & YELADIM", value: donations.filter((d) => d.type === "HANOUCA HAYALIM & YELADIM").length },
    { name: "Pourim", value: donations.filter((d) => d.type === "Pourim").length },
    { name: "kapparot", value: donations.filter((d) => d.type === "kapparot").length },
    { name: "DBI", value: donations.filter((d) => d.type === "DBI").length },
    { name: "merci", value: donations.filter((d) => d.type === "merci").length },
    { name: "Ahdoute", value: donations.filter((d) => d.type === "Ahdoute").length }
  ];

  return (
    <Box sx={{ padding: 4 }}>
      {/* Client Details */}
      <Paper sx={{ padding: 3, marginBottom: 3, boxShadow: 3 }}>
        <Typography variant="h4" gutterBottom>
          {fName} {lName}
        </Typography>
        {company && (
          <Typography variant="subtitle1" gutterBottom>
            Company: {company}
          </Typography>
        )}
        <Divider sx={{ marginY: 2 }} />
        <Typography variant="body1">
          <strong>Email:</strong> {email_1 || "N/A"}
        </Typography>
        <Typography variant="body1">
          <strong>Phone:</strong> {phone_number_1?.number || "N/A"}
        </Typography>
      </Paper>

      {/* Analytics */}
      <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap", mt: 4 }}>
        <Paper sx={{ flex: 1, p: 2, boxShadow: 3 }}>
          <Typography variant="h6">Total Donations</Typography>
          <Typography variant="h4" sx={{ color: "primary.main" }}>
            {Object.entries(groupedDonations).map(([currency ,total]) => (
              <Typography key={currency} variant="h5">
                {currency} { currencyIcons[currency]}: {total}
              </Typography>
            ))}
          </Typography>
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

      {/* Donations Table */}
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
      </Box>

      {/* Back Button */}
      <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={() => navigate("/dashboard/clients")}>
        Back to Clients
      </Button>
    </Box>
  );
};

export default ClientDetailsPage;
