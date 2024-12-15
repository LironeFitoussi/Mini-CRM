import React, { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TextField,
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

const DonationsPage = () => {
  // Example donation data
  const donations = [
    { id: 1, donor: "John Doe", amount: 100, date: "2024-12-01", type: "One-time" },
    { id: 2, donor: "Jane Smith", amount: 250, date: "2024-11-15", type: "Monthly" },
    { id: 3, donor: "Sam Wilson", amount: 75, date: "2024-11-10", type: "One-time" },
    { id: 4, donor: "Tony Stark", amount: 500, date: "2024-12-05", type: "One-time" },
    { id: 5, donor: "Bruce Wayne", amount: 1000, date: "2024-12-06", type: "Yearly" },
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;

  // Filtered donations based on search query
  const filteredDonations = donations.filter(
    (donation) =>
      donation.donor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.date.includes(searchQuery) ||
      donation.type.toLowerCase().includes(searchQuery)
  );

  // Pagination logic
  const handleChangePage = (event, newPage) => setPage(newPage);

  // Data for charts
  const totalDonations = donations.reduce((sum, donation) => sum + donation.amount, 0);
  const donationTypes = [
    { name: "One-time", value: donations.filter((d) => d.type === "One-time").length },
    { name: "Monthly", value: donations.filter((d) => d.type === "Monthly").length },
    { name: "Yearly", value: donations.filter((d) => d.type === "Yearly").length },
  ];

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

  return (
    <Box sx={{ padding: 4 }}>
      <h1>Donations Tracker</h1>

      {/* Search Input */}
      <TextField
        label="Search donations"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Analytics Section */}
      <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap", mt: 4 }}>
        {/* Total Donations */}
        <Box sx={{ flex: 1, p: 2, bgcolor: "white", borderRadius: 2, boxShadow: 1 }}>
          <h2>Total Donations</h2>
          <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>${totalDonations}</p>
        </Box>

        {/* Donation Types Chart */}
        <Box sx={{ flex: 1, p: 2, bgcolor: "white", borderRadius: 2, boxShadow: 1 }}>
          <h2>Donation Types</h2>
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
        </Box>

        {/* Donations Over Time */}
        <Box sx={{ flex: 1, p: 2, bgcolor: "white", borderRadius: 2, boxShadow: 1 }}>
          <h2>Donations Over Time</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={donations}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      {/* Donations Table */}
      <Box sx={{ mt: 4 }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Donor</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDonations
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell>{donation.donor}</TableCell>
                    <TableCell>${donation.amount}</TableCell>
                    <TableCell>{donation.date}</TableCell>
                    <TableCell>{donation.type}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={filteredDonations.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5]} // Fixed rows per page
        />
      </Box>
    </Box>
  );
};

export default DonationsPage;