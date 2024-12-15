import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Paper, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { mockClients, mockDonations } from "./mockData";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

const ClientDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const client = mockClients.find((client) => client.id === parseInt(id));
  const clientDonations = mockDonations.filter((donation) => donation.clientId === parseInt(id));

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

  // Analytics data
  const totalDonations = clientDonations.reduce((sum, donation) => sum + donation.amount, 0);
  const donationTypes = [
    { name: "One-time", value: clientDonations.filter((d) => d.type === "One-time").length },
    { name: "Monthly", value: clientDonations.filter((d) => d.type === "Monthly").length },
    { name: "Yearly", value: clientDonations.filter((d) => d.type === "Yearly").length },
  ];

  return (
    <Box sx={{ padding: 4 }}>
      {/* Client Details */}
      <Paper sx={{ padding: 3, marginBottom: 3, boxShadow: 3 }}>
        <Typography variant="h4" gutterBottom>
          {client.name}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Company: {client.company}
        </Typography>
        <Divider sx={{ marginY: 2 }} />
        <Typography variant="body1">
          <strong>Email:</strong> {client.email}
        </Typography>
        <Typography variant="body1">
          <strong>Phone:</strong> {client.phone}
        </Typography>
        <Typography variant="body1">
          <strong>Address:</strong> {client.address}
        </Typography>
      </Paper>

      {/* Analytics */}
      <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap", mt: 4 }}>
        <Paper sx={{ flex: 1, p: 2, boxShadow: 3 }}>
          <Typography variant="h6">Total Donations</Typography>
          <Typography variant="h4" sx={{ color: "primary.main" }}>
            ${totalDonations}
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
            <BarChart data={clientDonations}>
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
              {clientDonations.map((donation) => (
                <TableRow key={donation.id}>
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
