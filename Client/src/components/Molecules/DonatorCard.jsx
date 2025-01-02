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
import SmsIcon from "@mui/icons-material/Sms";
import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Tooltip as RechartsTooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import LaunchIcon from "@mui/icons-material/Launch";

import DonatorNotes from "../../components/Molecules/DonatorNotes";
// Buttons
import SendEmailButton from "../../components/Atoms/SendEmailButton"; // Adjust the path to your component
import SendWhatsappButton from "../../components/Buttons/SendWhatsappButton"; // Adjust the path to your component
import { useTranslation } from "react-i18next";
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300"];

const mockDonationData = [
  { name: "Campaign A", value: 400 },
  { name: "Campaign B", value: 300 },
  { name: "Campaign C", value: 300 },
  { name: "Campaign D", value: 200 },
];

const DonatorCard = ({ donatorId, onClose }) => {
  const { t } = useTranslation();
  const [showChart, setShowChart] = useState(false);
  const [donatorData, setDonatorData] = useState(null);

  console.log("DonatorCard -> donatorData", donatorData);

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
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Box>
        {/* Donator Details */}
        <Box>
          <Typography
            variant="h6"
            gutterBottom
            className="flex justify-between items-center"
          >
            {t("customerManagement.details")}
            {/* Open Donator Profile Button */}
            <Link sx={{ ml: 1, p: 1 }} to={`/dashboard/donators/${donatorId}`}>
              <LaunchIcon />
            </Link>
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body1">
            <strong>{t("clientInfo.name")}: </strong>
            {` ${donatorData?.fName || "Unknown"} ${donatorData?.lName || ""}`}
          </Typography>
        </Box>

        {/* Contact Options */}
        <Box>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>{t("clientInfo.contactOptions")}:</strong>
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            {/* Send Email Button */}
            <SendEmailButton
              recipient={donatorData?.email_1?.email || ""}
              defaultSubject={`Follow-up with ${
                donatorData?.fName || "Donator"
              }`}
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
        <Paper sx={{ p: 2, boxShadow: 3, mb: 3, mt: 2 }}>
          {/* Donator Notes */}
          <DonatorNotes donatorId={donatorId} note={donatorData?.notes} />
        </Paper>
      </Box>

      {/* Close Button */}
      <Button
        variant="contained"
        color="secondary"
        onClick={onClose}
        sx={{ mt: 2 }}
      >
        {t("actions.close")}
      </Button>
      {/* ========== Donator Notes ========== */}

      {/* Chart Toggle */}
      {/* <Button
        variant="outlined"
        color="primary"
        onClick={() => setShowChart((prev) => !prev)}
        sx={{ mt: 2 }}
      >
        {showChart ? "Hide Chart" : "Show Donations Chart"}
      </Button> */}

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
