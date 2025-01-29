import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import axios from "axios";

import { useDonator } from "../../../queryhooks/useDonator";

import SmsIcon from "@mui/icons-material/Sms";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import EditDonatorButton from "../../../components/Buttons/EditDonatorButton";
import DeleteDonatorButton from "../../../components/Atoms/DeleteDonatorButton";
import StatusSelect from "../../../components/Atoms/StatusSelect";
import AssignDonorOwner from "../../../components/Atoms/AssignDonorOwner";
import TaskCalendar from "../../../components/TaskCalendar";
import EmailModal from "../../../components/Modals/EmailModal";
import SendEmailButton from "../../../components/Atoms/SendEmailButton";
import DonatorNotes from "../../../components/Molecules/DonatorNotes";
import SendWhatsappButton from "../../../components/Buttons/SendWhatsappButton";
import DonationsComponent from "../../../components/Molecules/MainDonations";

import { getDonationTypes } from "../../../utils";

import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  CircularProgress,
} from "@mui/material";

const ClientDetailsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  // ========== Global User from Redux ==========
  const { user } = useSelector((state) => state.user);

  // ========== Local State ==========
  const [allodonData, setAllodonData] = useState([]);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    from: "contact.lesenfantsderachi@gmail.com",
    to: "",
    subject: "",
    body: "",
    imagePosition: "top",
    imageUrl: null,
  });

  // ========== Fetch Specific Client ==========
  const { data: client, isLoading, error } = useDonator(id);

  // ========== Side Effects ==========
  useEffect(() => {
    if (client?.allo_dons_id) {
      fetchAllodon(client.allo_dons_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client?.allo_dons_id]);

  // ========== Functions ==========
  const fetchAllodon = async (alloDonsId) => {
    const { data } = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/v1/donations/allodon/${alloDonsId}`
    );
    console.log(data);
    setAllodonData(data);
  };

  const handleEmailChange = (fieldName, newValue) => {
    setFormValues((prev) => ({ ...prev, [fieldName]: newValue }));
  };

  const handleEmailSubmit = async (values) => {
    try {
      alert("Email sent successfully!");
      setEmailModalOpen(false);
    } catch (err) {
      console.error("Failed to send email:", err);
      alert("Failed to send email.");
    }
  };

  // ========== Loading & Error States ==========
  if (isLoading) {
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
          {error.message}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/dashboard/clients")}
        >
          {t("actions.backToDonors")}
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
          {t("actions.backToDonors")}
        </Button>
      </Box>
    );
  }

  // ========== Destructure Needed Fields ==========
  const {
    fName,
    lName,
    email_1,
    phone_number_1,
    birthdate,
    donations = [],
    notes,
    status,
    allo_dons_id,
  } = client;

  // ========== Summarize Donations by Currency ==========
  const groupedDonations = donations.reduce((acc, donation) => {
    const { currency, amount } = donation;
    if (!acc[currency]) acc[currency] = 0;
    acc[currency] += amount;
    return acc;
  }, {});

  // ========== Setup for DonationsComponent ==========
  const donationTypes = getDonationTypes(donations);
  const currencyIcons = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    NIS: "₪",
  };

  // ========== Return JSX ==========
  return (
    <Box sx={{ padding: 4 }}>
      {/* ========== Main Info & Donations Chart ========== */}
      <Box sx={{ display: "flex", gap: 2, marginBottom: 3, flexWrap: "wrap" }}>
        {/* ---------- Left Paper: Client Info ---------- */}
        <Paper sx={{ flex: 1, boxShadow: 3, minWidth: 300 }}>
          <Box sx={{ p: 3 }}>
            <Typography
              variant="h4"
              gutterBottom
              className="flex justify-between"
            >
              {fName} {lName} {!fName && !lName && "This client has no name."}
              <StatusSelect
                currentStatus={status}
                donatorId={client._id}
                page={0}
                pageSize={10}
                search=""
              />
              <Box>
                <EditDonatorButton donatorData={client} />
                {/* {(user.role === "developer" || user.role === "admin") && (
                  <AddOwnerButton selectedDonorId={id} />
                )} */}
              </Box>
            </Typography>
            <Divider sx={{ my: 2 }} />

            {/* Contact Info */}
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Email:</strong> {email_1?.email || "N/A"}
            </Typography>
            {client?.email_2?.email && (
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Email 2:</strong> {client.email_2?.email || "N/A"}
              </Typography>
            )}
            {client?.email_3?.email && (
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Email 3:</strong> {client.email_3?.email || "N/A"}
              </Typography>
            )}

            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>{t("customerManagement.phone")} 1:</strong>{" "}
              {phone_number_1?.number || "N/A"}
            </Typography>
            {client?.phone_number_2?.number && (
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>{t("customerManagement.phone")} 2:</strong>{" "}
                {client.phone_number_2?.number || "N/A"}
              </Typography>
            )}
            {client?.phone_number_3?.number && (
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>{t("customerManagement.phone")} 3:</strong>{" "}
                {client.phone_number_3?.number || "N/A"}
              </Typography>
            )}

            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>{t("contactsManagement.birthDate")}:</strong>{" "}
              {birthdate
                ? new Date(birthdate).toLocaleDateString("en-GB")
                : "N/A"}
            </Typography>

            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>{t("contactsManagement.owner")}:</strong>{" "}
              {user.role !== "user" ? (
                <AssignDonorOwner
                  currentOwner={client.owner}
                  selectedDonorId={id}
                />
              ) : client.owner ? (
                <>
                  {client.owner.fName} {client.owner.lName}
                </>
              ) : (
                "N/A"
              )}
            </Typography>

            {/* ========== Quick Contact Buttons ========== */}
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <SendEmailButton recipient={email_1?.email} />
              <SendWhatsappButton recipientPhone={phone_number_1?.number} />
              <Button
                variant="contained"
                startIcon={<SmsIcon />}
                sx={{
                  backgroundColor: "#0088FE",
                  color: "white",
                  ":hover": { backgroundColor: "#0077e4" },
                }}
              >
                SMS
              </Button>
            </Box>

            {/* Donator nextContact */}
            {client.nextContactDate && (
              <Typography variant="body1" sx={{ mt: 2 }}>
                <strong>{t("contactsManagement.nextContact")}:</strong>
                {new Date(client.nextContactDate).toLocaleString("en-GB")}
              </Typography>
            )}
          </Box>
        </Paper>

        {/* ---------- Right Paper: Donations Chart ---------- */}
        <DonationsComponent
          t={t}
          allodonData={allodonData}
          currencyIcons={currencyIcons}
          donations={donations}
          donationTypes={donationTypes}
          donorId={id}
        />
      </Box>

      {/* ========== Donator Notes ========== */}
      <Paper sx={{ p: 2, boxShadow: 3, mb: 3 }}>
        <DonatorNotes donatorId={id} note={notes} key={id} />
      </Paper>

      {/* ========== Task Calendar ========== */}
      <Box sx={{ mb: 4 }}>
        <TaskCalendar notes={notes} donatorId={id} />
      </Box>

      {/* ========== Footer: Back & Delete ========== */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/dashboard/donors")}
          sx={{ display: "flex", gap: 1 }}
        >
          <ArrowCircleLeftIcon /> {t("actions.backToDonors")}
        </Button>
        <DeleteDonatorButton donatorData={client} />
      </Box>

      {/* ========== Email Modal ========== */}
      <EmailModal
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
