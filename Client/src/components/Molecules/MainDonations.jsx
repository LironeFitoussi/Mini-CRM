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
  Button
} from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import PropTypes from 'prop-types';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']; // Define your color palette

const DonationsComponent = ({
  t,
  allodonData,
  donations,
  donationTypes, 
  donorId,       // <- Pass the local donor _id here
}) => {
  // console.log('DonationsComponent:', allodonData);

DonationsComponent.propTypes = {
  t: PropTypes.func.isRequired,
  allodonData: PropTypes.array.isRequired,
  donations: PropTypes.array.isRequired,
  donationTypes: PropTypes.array.isRequired,
  donorId: PropTypes.string.isRequired,
};

  // Calculate total donations (just an example usage)

  // Create a record of donation amounts by currency
  const currencies = {};
  allodonData.forEach((donation) => {
    if (!currencies[donation.currency]) {
      currencies[donation.currency] = 0;
    }
    currencies[donation.currency] += donation.amount;
  });

  // 1) Manual Sync handler
  const handleManualSync = async () => {
    if (!donorId) {
      alert("No donorId provided for manual sync.");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/sync/allodons/${donorId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Sync failed:', errorData);
        alert(`Sync failed: ${errorData.error || "Unknown error"}`);
        return;
      }

      const data = await response.json();
      // console.log('Sync success:', data);
      alert(`Donations sync completed! New donations added: ${data.newDonations || 0}`);

      // Refresh the page after successful sync
      window.location.reload();
    } catch (error) {
      console.error('Network or server error:', error);
      alert('Error during sync: ' + error.message);
    }
  };

  return (
    <Paper sx={{ flex: 1, boxShadow: 3 }}>
      <Box sx={{ p: 3 }}>
        {/* Header Section */}
        <Box className="flex justify-between mb-4" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" gutterBottom>
            {t("general.totalDonations")}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* For Each Currency Key Display the Total Amount */}
            {Object.keys(currencies).map((currency) => (
              <Typography key={currency}>
                {currencies[currency]} {currency}
              </Typography>
            ))}
            {/* 2) Manual Sync Button */}
            <Button variant="contained" color="primary" onClick={handleManualSync}>
              {t("general.manualSync")}
            </Button>
          </Box>
        </Box>

        {/* Main Content: Donations Table and Pie Chart */}
        <Grid container spacing={4}>
          {/* Donations Table */}
          <Grid item xs={12} md={7}>
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
                        <TableCell>
                          {donation.amount} {donation.currency}
                        </TableCell>
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