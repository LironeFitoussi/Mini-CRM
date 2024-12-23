// src/components/TaskDetails.jsx
import React from "react";
import { Box, Grid, Typography, Chip, IconButton, Tooltip } from "@mui/material";
import { capitalizeFirstLetter } from "../../utils";
import { useQuery } from "@tanstack/react-query";
import { fetchDonatorById } from "../../api/donators";
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import LaunchIcon from '@mui/icons-material/Launch';
import { Modal } from "@mui/material";
import { Link } from "@mui/icons-material";
const statusOptions = [
  { value: "completed", label: "Completed", color: "success" },
  { value: "pending", label: "Pending", color: "warning" },
  { value: "critical", label: "Critical", color: "error" },
];

const getStatusColor = (muiColor) => {
  switch (muiColor) {
    case "success":
      return "green";
    case "warning":
      return "goldenrod";
    case "error":
      return "red";
    default:
      return "grey";
  }
};

const TaskDetails = ({ task }) => {
  const { data: donator, isLoading, isError } = useQuery({
    queryKey: ["donators", task.donator.id],
    queryFn: () => fetchDonatorById(task.donator.id),
  });

  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const currentStatus = statusOptions.find(
    (option) => option.value === task.status
  );

  if (isLoading) return <p>Loading...</p>;

  if (isError) return <p>Error fetching donator details.</p>;

  return (
    <>
      <Box sx={{ padding: 2, backgroundColor: "#f9f9f9", borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Donator:</Typography>
            <Box display="flex" alignItems="center">
              <Typography variant="body1">
                {donator.fName} {donator.lName}
              </Typography>
              <Tooltip title="View Donator Details">
                <IconButton onClick={() => setIsModalOpen(true)} size="small" sx={{ ml: 1 }}>
                  <RemoveRedEyeIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">User:</Typography>
            <Typography variant="body1">{task.user.fName} {task.user.lName}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Due Date:</Typography>
            <Typography variant="body1">
              {new Date(task.dueDate).toLocaleDateString()}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Status:</Typography>
            <Chip
              label={capitalizeFirstLetter(task.status)}
              color={currentStatus?.color || "default"}
              size="small"
              sx={{ bgcolor: getStatusColor(currentStatus?.color), color: "#fff" }}
            />
          </Grid>
        </Grid>
      </Box>

        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          aria-labelledby="donator-modal-title"
          aria-describedby="donator-modal-description"
        >
          <Box
            sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: 300, sm: 400 },
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            }}
          >
            <Grid container justifyContent="space-between" alignItems="center">
            <Typography id="donator-modal-title" variant="h6" component="h2" gutterBottom>
              Donator Details
            </Typography>
            <Box>
              <Tooltip title="Open in new tab">
                <IconButton
                component="a"
                href={`/dashboard/donators/${donator.id}`}
                rel="noopener noreferrer"
                size="small"
                >
                <LaunchIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            </Grid>
            <Grid container spacing={2}>
            {/* First Name */}
            <Grid item xs={12}>
              <Typography variant="subtitle2">First Name:</Typography>
              <Typography variant="body1">{donator.fName || "N/A"}</Typography>
            </Grid>
            {/* Last Name */}
            <Grid item xs={12}>
              <Typography variant="subtitle2">Last Name:</Typography>
              <Typography variant="body1">{donator.lName || "N/A"}</Typography>
            </Grid>
            {/* Email */}
            <Grid item xs={12}>
              <Typography variant="subtitle2">Email:</Typography>
              <Typography variant="body1">
                {donator.email_1 ? (
                  <a href={`mailto:${donator.email_1}`} style={{ textDecoration: 'none', color: '#1976d2' }}>
                    {donator.email_1}
                  </a>
                ) : (
                  "No email provided"
                )}
              </Typography>
            </Grid>
            {/* Phone Number */}
            <Grid item xs={12}>
              <Typography variant="subtitle2">Phone Number:</Typography>
              <Typography variant="body1">
                {donator.phone_number_1 && donator.phone_number_1.number ? (
                  <a href={`tel:${donator.phone_number_1.number}`} style={{ textDecoration: 'none', color: '#1976d2' }}>
                    {donator.phone_number_1.number}
                  </a>
                ) : (
                  "No phone number provided"
                )}
              </Typography>
            </Grid>
            {/* Additional Information (Optional) */}
            {/* You can add more fields here as needed */}
          </Grid>
        </Box>
      </Modal>
    </>
  );
};

export default TaskDetails;
