import React from "react";
import {
  Box,
  CircularProgress,
  Alert,
  Typography,
} from "@mui/material";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

/**
 * Renders the summary section with total donations and donation types chart.
 */
const DonationsSummary = ({
  loadingSummary,
  errorSummary,
  donationTypesData,
  totalDonations,
}) => {
  // Prepare data for Donation Types chart
  const donationTypesChartData = donationTypesData.map((type) => ({
    name: type.type,
    value: type.totalAmount,
  }));

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
    "#A28CFE",
    "#FF69B4",
  ];

  if (loadingSummary) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 2, width: "100%" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (errorSummary) {
    return (
      <Alert severity="error" sx={{ my: 2, width: "100%" }}>
        {errorSummary} — Please try again later.
      </Alert>
    );
  }

  return (
    <>
      {/* Total Donations Card */}
      <Box
        sx={{
          flex: 1,
          minWidth: 250,
          p: 2,
          bgcolor: "white",
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Typography variant="h6">Total Donations</Typography>
        <Typography variant="h4" color="primary">
          €
          {totalDonations.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Typography>
      </Box>

      {/* Donation Types Chart */}
      <Box
        sx={{
          flex: 1,
          minWidth: 300,
          p: 2,
          bgcolor: "white",
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Typography variant="h6">Donation Types</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={donationTypesChartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {donationTypesChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) =>
                `€${value.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </>
  );
};

export default DonationsSummary;
