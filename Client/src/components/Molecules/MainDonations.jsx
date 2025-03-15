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
  Tabs,
  Tab,
  // Button
} from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import PropTypes from 'prop-types';
import { useState } from 'react';
// Expanded color palette to handle more donation types
const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', 
  '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1',
  '#a4de6c', '#d0ed57', '#ffc658', '#d62728'
]; 

const DonationsComponent = ({
  t,
  allodonData,
  donations,
  // donationTypes, // Removed unused prop
  // donorId,       // <- Pass the local donor _id here
}) => {
  // Add state for tab selection
  const [chartTab, setChartTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setChartTab(newValue);
  };

  // Create a record of donation amounts by currency
  const currencies = {};
  allodonData.forEach((donation) => {
    if (!currencies[donation.currency]) {
      currencies[donation.currency] = 0;
    }
    currencies[donation.currency] += donation.amount;
  });

  // Create data for pie chart showing donation amounts by currency
  const currencyData = donations.reduce((acc, donation) => {
    // Normalize currency - some donations might have "1" instead of "NIS" or other currency codes
    const currency = donation.currency === "1" ? "NIS" : donation.currency;
    
    const existingIndex = acc.findIndex(item => item.name === currency);
    if (existingIndex >= 0) {
      acc[existingIndex].value += donation.amount;
    } else {
      acc.push({
        name: currency,
        value: donation.amount
      });
    }
    return acc;
  }, []);

  // Create data for pie chart showing donation amounts by notes/category
  const notesData = donations.reduce((acc, donation) => {
    // Skip donations with no notes
    if (!donation.notes) return acc;
    
    const existingIndex = acc.findIndex(item => item.name === donation.notes);
    if (existingIndex >= 0) {
      acc[existingIndex].value += donation.amount;
    } else {
      acc.push({
        name: donation.notes,
        value: donation.amount,
        currency: donation.currency === "1" ? "NIS" : donation.currency
      });
    }
    return acc;
  }, []);

  console.log('Currency Data for Chart:', currencyData);
  console.log('Notes Data for Chart:', notesData);
  
  // // 1) Manual Sync handler
  // const handleManualSync = async () => {
  //   if (!donorId) {
  //     alert("No donorId provided for manual sync.");
  //     return;
  //   }

  //   try {
  //     const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/sync/allodons/${donorId}`, {
  //       method: 'POST',
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       console.error('Sync failed:', errorData);
  //       alert(`Sync failed: ${errorData.error || "Unknown error"}`);
  //       return;
  //     }

  //     const data = await response.json();
  //     // console.log('Sync success:', data);
  //     alert(`Donations sync completed! New donations added: ${data.newDonations || 0}`);

  //     // Refresh the page after successful sync
  //     window.location.reload();
  //   } catch (error) {
  //     console.error('Network or server error:', error);
  //     alert('Error during sync: ' + error.message);
  //   }
  // };

  console.log('Donations:', donations);
  

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
            {/* <Button variant="contained" color="primary" onClick={handleManualSync}>
              {t("general.manualSync")}
            </Button> */}
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
            <Box sx={{ width: '100%', height: 450 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={chartTab} onChange={handleTabChange} centered>
                  <Tab label={t("donations.byCurrency")} />
                  <Tab label={t("donations.byCategory")} />
                </Tabs>
              </Box>
              
              <ResponsiveContainer width="100%" height={380}>
                <PieChart margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  {/* Currency Chart */}
                  {chartTab === 0 && currencyData.length > 0 && (
                    <Pie
                      data={currencyData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      outerRadius={100}
                      innerRadius={40}
                      fill="#8884d8"
                      paddingAngle={2}
                      label={({name, value, percent}) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={true}
                    >
                      {currencyData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="#fff"
                          strokeWidth={1}
                        />
                      ))}
                    </Pie>
                  )}
                  
                  {/* Notes/Category Chart */}
                  {chartTab === 1 && notesData.length > 0 && (
                    <Pie
                      data={notesData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      outerRadius={100}
                      innerRadius={40}
                      fill="#8884d8"
                      paddingAngle={2}
                      label={({name, value, percent}) => 
                        `${name.length > 15 ? name.substring(0, 15) + '...' : name}: ${value} (${(percent * 100).toFixed(0)}%)`
                      }
                      labelLine={true}
                    >
                      {notesData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="#fff"
                          strokeWidth={1}
                        />
                      ))}
                    </Pie>
                  )}
                  
                  <Tooltip 
                    formatter={(value, name, entry) => {
                      const currency = entry.payload.currency || '';
                      return [`${value} ${currency}`, name];
                    }}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '4px',
                      padding: '10px',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
                    }}
                  />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    iconType="circle"
                    iconSize={10}
                    formatter={(value, entry) => {
                      // Truncate long names in the legend
                      const displayName = value.length > 20 ? value.substring(0, 20) + '...' : value;
                      return `${displayName}: ${entry.payload.value}`;
                    }}
                    wrapperStyle={{ 
                      paddingLeft: '10px',
                      fontSize: '12px',
                      maxHeight: '300px',
                      overflowY: 'auto'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

DonationsComponent.propTypes = {
  t: PropTypes.func.isRequired,
  allodonData: PropTypes.array.isRequired,
  donations: PropTypes.array.isRequired,
  donorId: PropTypes.string.isRequired,
};

export default DonationsComponent;