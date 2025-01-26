import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Grid,
} from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']; // Define your color palette

const DonationsComponent = ({
  t,
  allodonData,
  currencyIcons,
  donations,
  donationTypes,
}) => {
  return (
    <Paper sx={{ flex: 1, boxShadow: 3 }}>
      <Box sx={{ p: 3 }}>
        {/* Header Section */}
        <Box className="flex justify-between mb-4">
          <Typography variant="h6" gutterBottom>
            {t("general.totalDonations")}
          </Typography>
          <Box className="flex space-x-2">
            {allodonData.map((donation) => (
              <Typography
                key={donation._id}
                variant="h5"
                sx={{
                  color: "primary.main",
                  textAlign: "center",
                }}
              >
                {donation.currency} {currencyIcons[donation.currency]}:{" "}
                {donation.total}
              </Typography>
            ))}
          </Box>
        </Box>

        {/* Main Content: Donations Table and Pie Chart */}
        <Grid container spacing={4}>
          {/* Donations Table */}
          <Grid item xs={12} md={7}>
            {/* <Typography variant="h6" gutterBottom>
              {t("general.donationsHistory")}
            </Typography> */}
            <Box
              sx={{
                maxHeight: 400, // Adjust as needed
                overflow: 'auto',
              }}
            >
              <TableContainer component={Paper}>
                <Table stickyHeader aria-label="donations table">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("donations.amount")}</TableCell>
                      <TableCell>{t("donations.date")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {donations.map((donation) => (
                      <TableRow key={donation._id} hover>
                        <TableCell>${donation.amount}</TableCell>
                        <TableCell>{donation.date.split("T")[0]}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Grid>

          {/* Pie Chart */}
          <Grid item xs={12} md={5}>
            {/* <Typography variant="h6" gutterBottom>
              {t("general.donationTypes")}
            </Typography> */}
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={donationTypes}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
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
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default DonationsComponent;
