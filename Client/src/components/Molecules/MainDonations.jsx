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
  donations,
  donationTypes,
}) => {
  console.log('DonationsComponent:', allodonData);
  
  const totalDonations = allodonData.reduce((acc, curr) => acc + curr.amount, 0);

  const currencies = {};
  // split arrays of currencies
  allodonData.forEach((donation) => {
    if (donation.currency === "$") {
      // Check if the currency is already in the object
      if (currencies[donation.currency]) {
        currencies[donation.currency] += donation.amount;
      } else {
        currencies[donation.currency] = donation.amount;
      }
    } else if (donation.currency === "€") {
      if (currencies[donation.currency]) {
        currencies[donation.currency] += donation.amount;
      } else {
        currencies[donation.currency] = donation.amount;
      }
    } else if (donation.currency === "£") {
      if (currencies[donation.currency]) {
        currencies[donation.currency] += donation.amount;
      } else {
        currencies[donation.currency] = donation.amount;
      }
    }
  });
  

  return (
    <Paper sx={{ flex: 1, boxShadow: 3 }}>
      <Box sx={{ p: 3 }}>
        {/* Header Section */}
        <Box className="flex justify-between mb-4">
          <Typography variant="h6" gutterBottom>
            {t("general.totalDonations")}
          </Typography>
          <Box className="flex space-x-2">
            {/* For Each Currency Key Display the Total Amount */}
            {Object.keys(currencies).map((currency) => (
              <Typography key={currency}>
                {currencies[currency]} {currency}
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
                      <TableCell>{t("donations.cerfa")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {donations.map((donation) => (
                      <TableRow key={donation._id} hover>
                        <TableCell>{donation.amount} {donation.currency}</TableCell>
                        <TableCell>{donation.date.split("T")[0]}</TableCell>
                        <TableCell>
                          <a
                            href={donation.cerfa}
                            download
                            target="_blank"
                            rel="noreferrer"
                          >
                            {t("general.view")}
                          </a>
                        </TableCell>
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
