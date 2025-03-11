// This Script is in charge of syncing the Allodon donations with our database

const axios = require("axios");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Donor = require("../models/Donor");
const Donation = require("../models/Donation");
const Notification = require("../models/Notification");
const fs = require('fs');
const path = require('path');

dotenv.config();

// Hardcoded configuration (will be added to .gitignore later)
const CONFIG = {
    // Database connection string
    MONGODB_URI: "mongodb+srv://lironefit:4YrMTTViFjGfG0yf@cluster0.e2j9t.mongodb.net/crm-data?retryWrites=true&w=majority&appName=Cluster0",
    
    // Allodon API token
    ALLODON_API_TOKEN: "3b5991b050cccd22c8ee444eb13e38219525851aff629127162962003d2d3e66716ad4d3a100f799317759eb3e",
    
    // Maximum retry attempts
    MAX_RETRIES: 3,
    
    // Error log file path
    ERROR_LOG_FILE: path.join(__dirname, '../logs/allodon_sync_errors.log')
};

// Ensure logs directory exists
const logsDir = path.dirname(CONFIG.ERROR_LOG_FILE);
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Helper function to log errors to file
const logError = (errorType, donorId, error) => {
    const timestamp = new Date().toISOString();
    const errorMessage = `[${timestamp}] [${errorType}] Donor ID: ${donorId} - Error: ${error.message || error}\n`;
    
    fs.appendFile(CONFIG.ERROR_LOG_FILE, errorMessage, (err) => {
        if (err) {
            console.error(`Failed to write to error log: ${err.message}`);
        }
    });
    
    console.error(`❌ [${errorType}] Error logged for donor ID ${donorId}`);
};

// Helper function for retrying operations
const retryOperation = async (operation, maxRetries, errorType, donorId) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            console.error(`❌ Attempt ${attempt}/${maxRetries} failed for ${errorType} - Donor ID: ${donorId} - Error: ${error.message}`);
            
            // Wait a bit longer between retries (exponential backoff)
            if (attempt < maxRetries) {
                const delay = Math.min(100 * Math.pow(2, attempt), 5000); // Max 5 seconds
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    // If we reach here, all retries failed
    logError(errorType, donorId, lastError);
    throw lastError;
};

// Log configuration
console.log('Using hardcoded configuration:');
console.log(`📊 Database: ${CONFIG.MONGODB_URI.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@')}`);
const token = CONFIG.ALLODON_API_TOKEN;
const firstChars = token.substring(0, 6);
const lastChars = token.substring(token.length - 4);
console.log(`🔑 API Token: ${firstChars}...${lastChars}`);
console.log(`📝 Error log file: ${CONFIG.ERROR_LOG_FILE}`);

// MongoDB connection handling
const ensureMongoDBConnection = async () => {
    // Check current connection state (0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting)
    if (mongoose.connection.readyState !== 1) {
        console.log(`🔌 MongoDB not connected (state: ${mongoose.connection.readyState}). Attempting to connect...`);
        
        // If not connected, and not already connecting, try to connect
        if (mongoose.connection.readyState !== 2) {
            try {
                // Add connection options to help with timeouts
                const options = {
                    serverSelectionTimeoutMS: 30000, // Timeout for server selection
                    socketTimeoutMS: 45000,          // How long the MongoDB driver will wait before timing out
                    connectTimeoutMS: 30000,         // How long to wait for initial connection
                };
                
                await mongoose.connect(CONFIG.MONGODB_URI, options);
                console.log(`✅ MongoDB connected successfully!`);
            } catch (error) {
                console.error(`❌ MongoDB connection error:`, error.message);
                throw error;
            }
        } else {
            console.log(`⏳ MongoDB connection in progress... waiting.`);
            
            // Wait for connection to complete
            await new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (mongoose.connection.readyState === 1) {
                        clearInterval(checkInterval);
                        console.log(`✅ MongoDB connected successfully!`);
                        resolve();
                    } else if (mongoose.connection.readyState === 0) {
                        clearInterval(checkInterval);
                        console.error(`❌ MongoDB connection failed`);
                        resolve();
                    }
                }, 500);
            });
        }
    } else {
        console.log(`✅ MongoDB already connected`);
    }
};

// Fetch donor details from Allodon API by ID
const fetchDonorDetails = async (donorId) => {
    return retryOperation(async () => {
        console.log(`🔍 Fetching donor details for ID: ${donorId}...`);
        
        // Set up authorization headers with bearer token
        const headers = {
            'Authorization': `Bearer ${CONFIG.ALLODON_API_TOKEN}`
        };
        
        const startTime = Date.now();
        const response = await axios.get(
            `https://www.allodons.fr/api/data/les-enfants-de-rachi/donors/${donorId}`, 
            { headers }
        );
        const fetchTime = ((Date.now() - startTime) / 1000).toFixed(2);
        
        console.log(`✅ Donor details received in ${fetchTime}s`);
        
        // Validate the response data
        if (!response.data || !response.data.id) {
            throw new Error(`Invalid API response format for donor ID ${donorId}`);
        }
        
        return response.data;
    }, CONFIG.MAX_RETRIES, 'API_FETCH', donorId);
};

// Process and save donations for a specific donor
const processAndSaveDonations = async (donorDetails, donorId) => {
    try {
        if (!donorDetails || !donorDetails.donations || !Array.isArray(donorDetails.donations)) {
            console.log(`No valid donations found for donor ID: ${donorId}`);
            return { processed: 0, added: 0, updated: 0, failed: 0, skipped: 0 };
        }
        
        const donations = donorDetails.donations;
        console.log(`Processing ${donations.length} donations for donor: ${donorDetails.first_name} ${donorDetails.last_name} (ID: ${donorId})`);
        
        const stats = { processed: 0, added: 0, updated: 0, failed: 0, skipped: 0 };
        
        // Use Promise.all to process donations in parallel
        const donationPromises = donations.map(async (donation) => {
            stats.processed++;
            
            try {
                await retryOperation(async () => {
                    // Check if donation already exists by remoteDonationId
                    const existingDonation = await Donation.findOne({ remoteDonationId: donation.id });
                    
                    if (existingDonation) {
                        console.log(`Donation ID ${donation.id} already exists, skipping...`);
                        stats.skipped++;
                        return; // Skip this donation
                    } else {
                        // Create new donation
                        const newDonation = new Donation({
                            donator_id: donorId, // MongoDB ObjectId of the donor
                            amount: donation.amount,
                            currency: donation.currency || '€',
                            euro_amount: donation.euro_amount,
                            date: new Date(donation.date),
                            method: donation.mode || 'Unknown',
                            notes: donation.comment || '',
                            remoteDonationId: donation.id, // Ensure the remote ID is properly set
                            platform: 'allodons',
                            infos: {
                                category: donation.category || '',
                                type: donation.type || '',
                                recurring: donation.recurring || false,
                                instalment: donation.instalment || '-',
                                additional: donation.infos || ''
                            }
                        });
                        
                        const saveResult = await newDonation.save();
                        if (saveResult) {
                            stats.added++;
                            console.log(`✅ Added new donation ID: ${donation.id}`);
                        } else {
                            throw new Error(`Failed to add donation ID: ${donation.id}`);
                        }
                    }
                }, CONFIG.MAX_RETRIES, 'DONATION_PROCESSING', `${donorId}:${donation.id}`);
            } catch (error) {
                stats.failed++;
                console.error(`❌ Error processing donation ID ${donation.id}:`, error.message);
                // Error already logged by retryOperation
            }
        });
        
        // Wait for all donation processing to complete
        await Promise.all(donationPromises);
        
        return stats;
    } catch (error) {
        console.error(`❌ Error processing donations for donor ID ${donorId}:`, error.message);
        logError('DONOR_PROCESSING', donorId, error);
        return { processed: 0, added: 0, updated: 0, failed: 0, skipped: 0 };
    }
};

// Main function to sync donations
const syncAlloDonations = async () => {
    console.log(`🔄 Starting Allodon donations sync process...`);
    const startTime = Date.now();
    const failedDonors = [];
    
    try {
        // Ensure MongoDB connection
        await ensureMongoDBConnection();
        
        // Find all donors with Allodon IDs
        const donors = await Donor.find({ allo_dons_id: { $exists: true, $ne: [] } })
            .select('_id allo_dons_id fName lName')
            .lean();
        
        console.log(`Found ${donors.length} donors with Allodon IDs`);
        
        // Tracking stats
        const stats = {
            totalDonors: donors.length,
            processedDonors: 0,
            failedDonors: 0,
            totalDonations: 0,
            addedDonations: 0,
            updatedDonations: 0,
            failedDonations: 0,
            skippedDonations: 0
        };
        
        // Process donors in parallel with Promise.all
        const donorPromises = donors.map(async (donor, index) => {
            const donorIndex = index + 1;
            console.log(`\n[${donorIndex}/${stats.totalDonors}] Processing donor: ${donor.fName} ${donor.lName} (ID: ${donor._id})`);
            
            try {
                // Process each Allodon ID for this donor in parallel
                const allodonPromises = donor.allo_dons_id.map(async (allodonId) => {
                    console.log(`Fetching details for Allodon ID: ${allodonId}`);
                    
                    try {
                        // Fetch donor details from Allodon API
                        const donorDetails = await fetchDonorDetails(allodonId);
                        
                        if (donorDetails) {
                            // Process and save donations
                            return await processAndSaveDonations(donorDetails, donor._id);
                        }
                        return { processed: 0, added: 0, updated: 0, failed: 0, skipped: 0 };
                    } catch (error) {
                        console.error(`❌ Failed to process Allodon ID ${allodonId} for donor ${donor._id}:`, error.message);
                        // Error already logged by retryOperation
                        return { processed: 0, added: 0, updated: 0, failed: 0, skipped: 0 };
                    }
                });
                
                // Wait for all Allodon IDs to be processed for this donor
                const allodonResults = await Promise.all(allodonPromises);
                
                // Aggregate stats for this donor
                const donorStats = allodonResults.reduce((acc, stat) => {
                    acc.processed += stat.processed;
                    acc.added += stat.added;
                    acc.updated += stat.updated;
                    acc.failed += stat.failed;
                    acc.skipped += stat.skipped;
                    return acc;
                }, { processed: 0, added: 0, updated: 0, failed: 0, skipped: 0 });
                
                // Check if there were failures
                if (donorStats.failed > 0) {
                    failedDonors.push({
                        id: donor._id,
                        name: `${donor.fName} ${donor.lName}`,
                        failedCount: donorStats.failed
                    });
                }
                
                // Return the stats for this donor
                return donorStats;
            } catch (error) {
                console.error(`❌ Error processing donor ${donor._id}:`, error.message);
                logError('DONOR_PROCESSING', donor._id, error);
                failedDonors.push({
                    id: donor._id,
                    name: `${donor.fName} ${donor.lName}`,
                    error: error.message
                });
                stats.failedDonors++;
                return { processed: 0, added: 0, updated: 0, failed: 0, skipped: 0 };
            }
        });
        
        // Wait for all donors to be processed
        const donorResults = await Promise.all(donorPromises);
        
        // Aggregate final stats
        stats.processedDonors = donors.length;
        donorResults.forEach(result => {
            stats.totalDonations += result.processed;
            stats.addedDonations += result.added;
            stats.updatedDonations += result.updated;
            stats.failedDonations += result.failed;
            stats.skippedDonations += result.skipped;
        });
        
        // Log summary of failed donors
        if (failedDonors.length > 0) {
            console.log(`\n⚠️ ${failedDonors.length} donors had errors during processing`);
            const failedDonorsLog = failedDonors.map(d => 
                `- Donor: ${d.name} (ID: ${d.id}), Failed items: ${d.failedCount || 'N/A'}, Error: ${d.error || 'See log for details'}`
            ).join('\n');
            console.log(failedDonorsLog);
            
            // Write failed donors to a separate file
            const failedDonorsFile = path.join(logsDir, 'failed_donors.log');
            const failedDonorsContent = `Failed donors from sync on ${new Date().toISOString()}:\n${failedDonorsLog}\n\n`;
            fs.appendFileSync(failedDonorsFile, failedDonorsContent);
        }
        
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`\n🏁 Allodon donations sync completed in ${duration}s`);
        console.log(`Sync Summary:
        - Donors processed: ${stats.processedDonors}/${stats.totalDonors}
        - Donors failed: ${stats.failedDonors}
        - Donations processed: ${stats.totalDonations}
        - Donations added: ${stats.addedDonations}
        - Donations updated: ${stats.updatedDonations}
        - Donations failed: ${stats.failedDonations}
        - Donations skipped: ${stats.skippedDonations}
        `);
        
        return stats;
    } catch (error) {
        console.error(`❌ Sync process error:`, error);
        logError('SYNC_PROCESS', 'GLOBAL', error);
        throw error;
    }
};

// Execute the sync process if this script is run directly
if (require.main === module) {
    syncAlloDonations()
        .then(() => {
            console.log(`✅ Sync process completed successfully`);
            process.exit(0);
        })
        .catch((error) => {
            console.error(`❌ Sync process failed:`, error);
            process.exit(1);
        });
} else {
    // Export for use in other modules
    module.exports = {
        syncAlloDonations,
        fetchDonorDetails,
        processAndSaveDonations
    };
} 