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
  Modal,
  IconButton,
  Card,
  CardContent,
  Divider,
  // Button
} from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
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
  // Add state for modal
  const [openModal, setOpenModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);

  const handleTabChange = (event, newValue) => {
    setChartTab(newValue);
  };

  // Modal handlers
  const handleOpenModal = (donation) => {
    setSelectedDonation(donation);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedDonation(null);
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
      <Box sx={{ p: 4 }}>
        {/* Header Section */}
        <Box className="flex justify-between mb-4" sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4
        }}>
          <Typography variant="h6" gutterBottom={false}>
            {t("general.totalDonations")}
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            {/* For Each Currency Key Display the Total Amount */}
            {Object.keys(currencies).map((currency) => (
              <Typography key={currency} sx={{ fontWeight: 'medium' }}>
                {currencies[currency]} {currency}
              </Typography>
            ))}
          </Box>
        </Box>

        {/* Main Content: Donations Table and Pie Chart */}
        <Grid container spacing={4}>
          {/* Donations Table */}
          <Grid item xs={12} md={7}>
            <Box
              sx={{
                maxHeight: 400,
                overflow: 'auto',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table stickyHeader aria-label="donations table">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("donations.amount")}</TableCell>
                      <TableCell>{t("donations.date")}</TableCell>
                      <TableCell>{t("donations.cerfa")}</TableCell>
                      <TableCell align="center">{t("general.details")}</TableCell>
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
                          {typeof donation.cerfa === 'number' || !isNaN(Number(donation.cerfa)) ? (
                            <Typography variant="body2" color="text.secondary">
                              {donation.cerfa}
                            </Typography>
                          ) : donation.cerfa ? (
                            <IconButton
                              size="small"
                              color="primary"
                              href={donation.cerfa}
                              download
                              target="_blank"
                              rel="noreferrer"
                              aria-label="download cerfa"
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          ) : (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={() => handleOpenModal(donation)}
                            aria-label="view donation details"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
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
            <Box sx={{ 
              width: '100%', 
              height: 450, 
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 2
            }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={chartTab} onChange={handleTabChange} centered>
                  <Tab label={t("donations.byCurrency")} />
                  <Tab label={t("donations.byCategory")} />
                </Tabs>
              </Box>
              
              <ResponsiveContainer width="100%" height={360}>
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
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Donation Details Modal */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="donation-details-modal"
        aria-describedby="modal-showing-full-donation-details"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card sx={{ 
          width: '90%', 
          maxWidth: 600, 
          maxHeight: '90vh',
          overflow: 'auto',
          p: 3,
          boxShadow: 24,
          borderRadius: 2,
        }}>
          {selectedDonation && (
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              <Typography variant="h6" component="h2" gutterBottom sx={{ mb: 2 }}>
                {t("donations.detailsTitle")}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                {Object.entries(selectedDonation).map(([key, value]) => {
                  // Skip the infos.original field as requested
                  if (key === 'infos' && value && value.original) {
                    // Destructure with rest pattern but don't use original
                    // eslint-disable-next-line no-unused-vars
                    const { original, ...restInfos } = value;
                    value = restInfos;
                  }
                  
                  // Get translated field title based on key
                  const getTitleForKey = (keyName) => {
                    // Map keys to translation keys
                    const keyTranslationMap = {
                      _id: "donations.modal.id",
                      amount: "donations.modal.amount",
                      currency: "donations.modal.currency",
                      date: "donations.modal.date",
                      cerfa: "donations.modal.cerfa",
                      notes: "donations.modal.notes",
                      infos: "donations.modal.additionalInfo",
                      donorId: "donations.modal.donorId",
                      donor: "donations.modal.donor",
                      createdAt: "donations.modal.createdAt",
                      updatedAt: "donations.modal.updatedAt",
                      // Add more mappings as needed
                    };
                    
                    return keyTranslationMap[keyName] 
                      ? t(keyTranslationMap[keyName]) 
                      : keyName.charAt(0).toUpperCase() + keyName.slice(1);
                  };
                  
                  // Format the value for display
                  let displayValue = value;
                  if (typeof value === 'object' && value !== null) {
                    if (Array.isArray(value)) {
                      displayValue = JSON.stringify(value, null, 2);
                    } else {
                      return (
                        <Grid item xs={12} key={key}>
                          <Typography variant="subtitle1" color="primary" fontWeight="500">
                            {getTitleForKey(key)}
                          </Typography>
                          <Box 
                            sx={{ 
                              pl: 0, 
                              mb: 3, 
                              p: 2, 
                              bgcolor: 'background.paper', 
                              borderRadius: 1, 
                              border: '1px solid',
                              borderColor: 'divider'
                            }}
                          >
                            {Object.entries(value).map(([subKey, subValue]) => {
                              // Get translated field title for subkey
                              const getSubTitleForKey = (parentKey, childKey) => {
                                const combinedKey = `${parentKey}.${childKey}`;
                                const subKeyTranslationMap = {
                                  'infos.type': "donations.modal.infoType",
                                  'infos.method': "donations.modal.paymentMethod",
                                  'infos.status': "donations.modal.status",
                                  // Add more mappings as needed
                                };
                                
                                return subKeyTranslationMap[combinedKey] 
                                  ? t(subKeyTranslationMap[combinedKey]) 
                                  : childKey.charAt(0).toUpperCase() + childKey.slice(1);
                              };
                              
                              return (
                                <Typography key={subKey} variant="body2" sx={{ mb: 0.5 }}>
                                  <strong>{getSubTitleForKey(key, subKey)}:</strong> {
                                    typeof subValue === 'object' && subValue !== null
                                      ? JSON.stringify(subValue)
                                      : String(subValue)
                                  }
                                </Typography>
                              );
                            })}
                          </Box>
                        </Grid>
                      );
                    }
                  } else if (key === 'date') {
                    // Format date for better readability
                    displayValue = new Date(value).toLocaleString();
                  } else {
                    displayValue = String(value);
                  }

                  return (
                    <Grid item xs={6} key={key}>
                      <Typography variant="subtitle1" color="primary" fontWeight="500">
                        {getTitleForKey(key)}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mb: 2,
                          p: 2,
                          bgcolor: 'background.paper',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider'
                        }} 
                        component="pre" 
                        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                      >
                        {displayValue}
                      </Typography>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          )}
        </Card>
      </Modal>
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