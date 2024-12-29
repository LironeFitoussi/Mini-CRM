import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Button,
  Divider,
  Box,
  Tooltip,
  IconButton,
} from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import SmsIcon from "@mui/icons-material/Sms";
import {
  PieChart,
  Pie,
  Tooltip as RechartsTooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";

// Buttons
import SendEmailButton from "../../components/Atoms/SendEmailButton"; // Adjust the path to your component
import SendWhatsappButton from "../../components/Buttons/SendWhatsappButton"; // Adjust the path to your component

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300"];

const mockDonationData = [
  { name: "Campaign A", value: 400 },
  { name: "Campaign B", value: 300 },
  { name: "Campaign C", value: 300 },
  { name: "Campaign D", value: 200 },
];

const DonatorCard = ({ donatorId, onClose }) => {
  const [showChart, setShowChart] = useState(false);
  const [donatorData, setDonatorData] = useState(null);
    
  // Fetch donator data
  useEffect(() => {
    const fetchDonatorData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/v1/donators/${donatorId}`
        );
        setDonatorData(response.data);
      } catch (error) {
        console.error("Failed to fetch donator data:", error);
      }
    };

    fetchDonatorData();
  }, [donatorId]);

  return (
    <Paper
      elevation={3}
      sx={{
        width: "15vw",
        ml: 2,
        p: 2,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {/* Donator Details */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Donator Details
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body1">
          <strong>Name:</strong>
          {` ${donatorData?.fName || "Unknown"} ${donatorData?.lName || ""}`}
        </Typography>
      </Box>

      {/* Contact Options */}
      <Box>
        <Typography variant="body1" sx={{ mb: 1 }}>
          <strong>Contact Options:</strong>
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {/* Send Email Button */}
          <SendEmailButton
            recipient={donatorData?.email_1?.email || ""}
            defaultSubject={`Follow-up with ${donatorData?.fName || "Donator"}`}
            defaultBody="Dear Donator, thank you for your continued support."
          />

          {/* WhatsApp Button */}
          <SendWhatsappButton
            recipientPhone={donatorData?.phone_number_1?.number || ""}
          />
          {/* SMS Button */}
          <Tooltip title="Send SMS">
            <IconButton sx={{ color: "#0088FE" }}>
              <SmsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Close Button */}
      <Button
        variant="contained"
        color="secondary"
        onClick={onClose}
        sx={{ mt: 2 }}
      >
        Close
      </Button>

      {/* Chart Toggle */}
      <Button
        variant="outlined"
        color="primary"
        onClick={() => setShowChart((prev) => !prev)}
        sx={{ mt: 2 }}
      >
        {showChart ? "Hide Chart" : "Show Donations Chart"}
      </Button>

      {/* Donations Chart */}
      {showChart && (
        <Box sx={{ mt: 2, width: "100%", height: 150 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={mockDonationData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={50}
                fill="#8884d8"
              >
                {mockDonationData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Paper>
  );
};

export default DonatorCard;
