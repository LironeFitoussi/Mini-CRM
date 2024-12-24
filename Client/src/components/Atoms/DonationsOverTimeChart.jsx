import React from "react";
import {
  Box,
  Typography,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/**
 * Renders the bar chart showing donations over time.
 */
const DonationsOverTimeChart = ({ donations }) => {
  // If no donations, render nothing (or a message)
  if (!donations || donations.length === 0) {
    return null;
  }

  return (
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
      <Typography variant="h6">Donations Over Time</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={donations}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <XAxis
            dataKey="date"
            tickFormatter={(tick) =>
              new Date(tick).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            }
          />
          <YAxis />
          <Tooltip
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
            formatter={(value) =>
              `€${value.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            }
          />
          <Bar dataKey="amount" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default DonationsOverTimeChart;
