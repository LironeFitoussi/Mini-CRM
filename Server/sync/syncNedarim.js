// This Script is in charge of syncing the Nedarim donations and donors with our database

const axios = require("axios");
const Donor = require("../models/Donor");
const Donation = require("../models/Donation"); // Import the Donation model
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Notification = require("../models/Notification");

dotenv.config();

// Hardcoded configuration (will be added to .gitignore later)
const CONFIG = {
    // Database connection string
    MONGODB_URI: "mongodb+srv://lironefit:4YrMTTViFjGfG0yf@cluster0.e2j9t.mongodb.net/crm-data?retryWrites=true&w=majority&appName=Cluster0",
    
    // Nedarim API URL - Real endpoint
    NEDARIM_API_URL: "https://matara.pro/nedarimplus/Reports/Manage3.aspx?Action=GetHistoryJson&MosadId=7011486&ApiPassword=tp193"
};

// Log configuration
console.log('Using hardcoded configuration:');
console.log(`📊 Database: ${CONFIG.MONGODB_URI.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@')}`);
console.log(`🔗 API URL: ${CONFIG.NEDARIM_API_URL.replace(/ApiPassword=([^&]+)/, 'ApiPassword=****')}`);

// Helper function to safely handle circular references in error objects
const safeStringify = (obj, space = 2) => {
    const cache = new Set();
    return JSON.stringify(obj, (key, value) => {
        if (key === 'request' || key === 'response' || key === 'config') {
            return '[Circular]';
        }
        if (typeof value === 'object' && value !== null) {
            if (cache.has(value)) {
                return '[Circular]';
            }
            cache.add(value);
        }
        return value;
    }, space);
};

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
                    maxPoolSize: 50                  // Increase connection pool size for parallel operations
                };
                
                // Check if we need to connect or if we just need to wait for an existing connection
                if (mongoose.connection.readyState === 0) {
                    // Use the hardcoded MongoDB URI
                    await mongoose.connect(CONFIG.MONGODB_URI, options);
                    console.log(`✅ MongoDB connected successfully`);
                } else {
                    console.log(`⏳ MongoDB is in state ${mongoose.connection.readyState}, waiting for connection...`);
                    // Wait for the connection to be established
                    await new Promise(resolve => {
                        mongoose.connection.once('connected', resolve);
                        // Add a timeout just in case
                        setTimeout(resolve, 20000);
                    });
                    
                    if (mongoose.connection.readyState === 1) {
                        console.log(`✅ MongoDB connected successfully`);
                    } else {
                        throw new Error(`Failed to connect to MongoDB after waiting`);
                    }
                }
                
                // After successful connection, modify the Donor model to disable automatic population
                try {
                    console.log('🔧 Disabling Mongoose hooks and automatic population...');
                    
                    // Get the Donor model
                    const DonorModel = mongoose.model('Donor');
                    
                    // Override methods that might trigger population
                    const originalFind = DonorModel.find;
                    DonorModel.find = function(...args) {
                        return originalFind.apply(this, args).select('fName lName allo_dons_id nedarim_id platform_type email_1 email_2 email_3 phone_number_1 phone_number_2 phone_number_3 status').lean();
                    };
                    
                    const originalFindOne = DonorModel.findOne;
                    DonorModel.findOne = function(...args) {
                        return originalFindOne.apply(this, args).select('fName lName allo_dons_id nedarim_id platform_type email_1 email_2 email_3 phone_number_1 phone_number_2 phone_number_3 status').lean();
                    };
                    
                    const originalFindById = DonorModel.findById;
                    DonorModel.findById = function(...args) {
                        return originalFindById.apply(this, args).select('fName lName allo_dons_id nedarim_id platform_type email_1 email_2 email_3 phone_number_1 phone_number_2 phone_number_3 status').lean();
                    };
                    
                    // Try to disable pre-find hooks if possible
                    if (DonorModel.schema.hooks && DonorModel.schema.hooks._pres && DonorModel.schema.hooks._pres.find) {
                        DonorModel.schema.hooks._pres.find.length = 0;
                        console.log('✅ Successfully cleared pre-find hooks');
                    }
                    
                    console.log('✅ Mongoose hooks and automatic population disabled');
                } catch (hookError) {
                    console.warn('⚠️ Could not fully disable Mongoose hooks:', hookError.message);
                    console.warn('Will use direct MongoDB operations instead');
                }
                
            } catch (error) {
                console.error(`❌ MongoDB connection error:`, error.message);
                throw error;
            }
        } else {
            console.log(`⏳ MongoDB is currently connecting, waiting...`);
            // Wait for the connection to be established
            await new Promise(resolve => {
                mongoose.connection.once('connected', resolve);
                // Add a timeout just in case
                setTimeout(resolve, 20000);
            });
        }
    } else {
        console.log(`✅ MongoDB already connected`);
        
        // Even if already connected, try to disable hooks and automatic population
        try {
            console.log('🔧 Disabling Mongoose hooks and automatic population...');
            
            // Get the Donor model
            const DonorModel = mongoose.model('Donor');
            
            // Override methods that might trigger population
            const originalFind = DonorModel.find;
            DonorModel.find = function(...args) {
                return originalFind.apply(this, args).select('fName lName allo_dons_id nedarim_id platform_type email_1 email_2 email_3 phone_number_1 phone_number_2 phone_number_3 status').lean();
            };
            
            const originalFindOne = DonorModel.findOne;
            DonorModel.findOne = function(...args) {
                return originalFindOne.apply(this, args).select('fName lName allo_dons_id nedarim_id platform_type email_1 email_2 email_3 phone_number_1 phone_number_2 phone_number_3 status').lean();
            };
            
            const originalFindById = DonorModel.findById;
            DonorModel.findById = function(...args) {
                return originalFindById.apply(this, args).select('fName lName allo_dons_id nedarim_id platform_type email_1 email_2 email_3 phone_number_1 phone_number_2 phone_number_3 status').lean();
            };
            
            // Try to disable pre-find hooks if possible
            if (DonorModel.schema.hooks && DonorModel.schema.hooks._pres && DonorModel.schema.hooks._pres.find) {
                DonorModel.schema.hooks._pres.find.length = 0;
                console.log('✅ Successfully cleared pre-find hooks');
            }
            
            console.log('✅ Mongoose hooks and automatic population disabled');
        } catch (hookError) {
            console.warn('⚠️ Could not fully disable Mongoose hooks:', hookError.message);
            console.warn('Will use direct MongoDB operations instead');
        }
    }
};

// Step 1: Fetch Nedarim donations
const fetchNedarimDonations = async () => {
    try {
        console.log(`🔍 Fetching donations from Nedarim API...`);
        console.log(`API URL: ${CONFIG.NEDARIM_API_URL.replace(/ApiPassword=([^&]+)/, 'ApiPassword=****')}`);
        
        // No need for special authentication headers as the API key is in the URL
        const headers = {
            'Content-Type': 'application/json'
        };
        
        const startTime = Date.now();
        const response = await axios.get(CONFIG.NEDARIM_API_URL, { headers });
        const fetchTime = ((Date.now() - startTime) / 1000).toFixed(2);
        
        console.log(`✅ API Response received in ${fetchTime}s`);
        console.log(`Status: ${response.status} ${response.statusText}`);
        
        // Validate the response data
        if (!response.data || !Array.isArray(response.data)) {
            console.error(`❌ Invalid API response format:`);
            console.error(safeStringify(response.data).substring(0, 500) + '...');
            throw new Error("Invalid API response format");
        }
        
        // Log data sample (first donation for debugging)
        if (response.data.length > 0) {
            console.log(`📊 Sample donation data (first record):`);
            console.log(safeStringify(response.data[0]));
            
            // Check for data quality issues
            const donorsWithNoEmail = response.data.filter(d => !d.Mail).length;
            const donorsWithNoPhone = response.data.filter(d => !d.Phone).length;
            const donorsWithNoEmailOrPhone = response.data.filter(d => !d.Mail && !d.Phone).length;
            const donorsWithNoZeout = response.data.filter(d => !d.Zeout || d.Zeout === '').length;
            
            console.log(`📊 Data quality check:`);
            console.log(`- Total donation records: ${response.data.length}`);
            console.log(`- Records with no email: ${donorsWithNoEmail} (${((donorsWithNoEmail/response.data.length)*100).toFixed(1)}%)`);
            console.log(`- Records with no phone: ${donorsWithNoPhone} (${((donorsWithNoPhone/response.data.length)*100).toFixed(1)}%)`);
            console.log(`- Records with neither email nor phone: ${donorsWithNoEmailOrPhone} (${((donorsWithNoEmailOrPhone/response.data.length)*100).toFixed(1)}%)`);
            console.log(`- Records with no Zeout ID: ${donorsWithNoZeout} (${((donorsWithNoZeout/response.data.length)*100).toFixed(1)}%)`);
        }
        
        return response.data;
    } catch (error) {
        console.error("❌ Error fetching Nedarim donations:", error.message);
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Headers: ${safeStringify(error.response.headers)}`);
            console.error(`Data: ${safeStringify(error.response.data).substring(0, 500)}`);
        } else if (error.request) {
            console.error(`No response received. Request details (hostname): ${error.request.host || 'unknown'}`);
        } else {
            console.error(`Error message: ${error.message}`);
        }
        
        // Re-throw the error to be handled by the caller
        throw error;
    }
};

// Direct MongoDB insert to bypass Mongoose hooks
const directInsertDonor = async (donorData) => {
    try {
        // Get direct access to the MongoDB collection
        const donorCollection = mongoose.connection.db.collection('donors');
        
        // Add timestamps that Mongoose would normally add
        donorData.createdAt = new Date();
        donorData.updatedAt = new Date();
        
        // Insert directly to MongoDB, bypassing Mongoose
        const result = await donorCollection.insertOne(donorData);
        console.log(`✅ Directly inserted donor with ID: ${result.insertedId}`);
        
        // Return the inserted document with its ID
        return { 
            _id: result.insertedId,
            ...donorData
        };
    } catch (error) {
        console.error('❌ Error directly inserting donor:', error.message);
        throw error;
    }
};

// Add a direct MongoDB update helper function
const directUpdateDonor = async (donorId, updateData) => {
    try {
        // Get direct access to the MongoDB collection
        const donorCollection = mongoose.connection.db.collection('donors');
        
        // Add updatedAt timestamp
        updateData.updatedAt = new Date();
        
        // Update directly in MongoDB, bypassing Mongoose
        const result = await donorCollection.updateOne(
            { _id: new mongoose.Types.ObjectId(donorId) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            console.warn(`⚠️ No donor found with ID ${donorId} to update`);
            return null;
        }
        
        console.log(`✅ Directly updated donor with ID: ${donorId}`);
        
        // Get the updated document
        const updatedDonor = await donorCollection.findOne({ _id: new mongoose.Types.ObjectId(donorId) });
        return updatedDonor;
    } catch (error) {
        console.error('❌ Error directly updating donor:', error.message);
        throw error;
    }
};

// Direct MongoDB insert for donation records
const directInsertDonation = async (donationData) => {
    try {
        // Get direct access to the MongoDB collection
        const donationCollection = mongoose.connection.db.collection('donations');
        
        // Add timestamps that Mongoose would normally add
        donationData.createdAt = new Date();
        donationData.updatedAt = new Date();
        
        // Insert directly to MongoDB, bypassing Mongoose
        const result = await donationCollection.insertOne(donationData);
        console.log(`✅ Directly inserted donation with ID: ${result.insertedId}`);
        
        // Return the inserted document with its ID
        return { 
            _id: result.insertedId,
            ...donationData
        };
    } catch (error) {
        console.error('❌ Error directly inserting donation:', error.message);
        // If duplicate key error (likely on remoteDonationId), log and return null
        if (error.code === 11000) {
            console.log(`ℹ️ Donation with this remoteDonationId already exists (${donationData.remoteDonationId})`);
            return null;
        }
        throw error;
    }
};

// Process and save donations to our database
const processAndSaveDonations = async (nedarimDonations) => {
    const processedDonations = [];
    console.log(`========== STARTING SYNC PROCESS ==========`);
    console.log(`Total donation records to process: ${nedarimDonations.length}`);

    // List of fields we need from the Donor model (to avoid automatic population)
    const selectFields = 'fName lName allo_dons_id nedarim_id platform_type email_1 email_2 email_3 phone_number_1 phone_number_2 phone_number_3 status';
    
    // Track already processed transaction IDs to avoid duplicates
    const processedIds = new Set();

    for (const donation of nedarimDonations) {
        try {
            // Skip if we've already processed a donation with this TransactionId
            if (processedIds.has(donation.TransactionId)) {
                console.log(`\n----- Skipping duplicate donation with TransactionId: ${donation.TransactionId} -----`);
                continue;
            }
            
            // Add this ID to our processed set
            processedIds.add(donation.TransactionId);
            
            console.log(`\n----- Processing donation from: ${donation.ClientName} (TransactionId: ${donation.TransactionId}) -----`);
            console.log(`Contact info - Email: ${donation.Mail || 'none'}, Phone: ${donation.Phone || 'none'}, Zeout: ${donation.Zeout || 'none'}`);
            
            // First handle donor data - find or create
            let donor = null;
            
            // First try to find donor by Zeout ID (if available)
            if (donation.Zeout && donation.Zeout !== '') {
                donor = await Donor.findOne({ nedarim_id: donation.Zeout })
                    .select(selectFields)
                    .lean();
                    
                console.log(`Searching by Zeout ID ${donation.Zeout}: ${donor ? 'FOUND' : 'NOT FOUND'}`);
            }
            
            // If not found by Zeout, try by Email
            if (!donor && donation.Mail) {
                console.log(`Attempting to find by email...`);
                const query = { $or: [] };
                
                // Check all three email fields
                for (let i = 1; i <= 3; i++) {
                    query.$or.push({ [`email_${i}.email`]: donation.Mail });
                }
                console.log(`Added email "${donation.Mail}" to search query`);
                
                // Only run the query if we have conditions
                if (query.$or.length > 0) {
                    donor = await Donor.findOne(query)
                        .select(selectFields)
                        .lean();
                        
                    console.log(`Search by email: ${donor ? 'FOUND MATCH' : 'NO MATCH'}`);
                    if (donor) {
                        console.log(`Matched donor: ${donor.fName} ${donor.lName} (ID: ${donor._id})`);
                    }
                }
            }
            
            // If still not found, check by phone number
            if (!donor && donation.Phone) {
                console.log(`Attempting to find by phone...`);
                const query = { $or: [] };
                
                // Check all three phone fields
                for (let i = 1; i <= 3; i++) {
                    query.$or.push({ [`phone_number_${i}.number`]: donation.Phone });
                }
                console.log(`Added phone "${donation.Phone}" to search query`);
                
                // Only run the query if we have conditions
                if (query.$or.length > 0) {
                    donor = await Donor.findOne(query)
                        .select(selectFields)
                        .lean();
                        
                    console.log(`Search by phone: ${donor ? 'FOUND MATCH' : 'NO MATCH'}`);
                    if (donor) {
                        console.log(`Matched donor: ${donor.fName} ${donor.lName} (ID: ${donor._id})`);
                    }
                }
            }
            
            // If donor not found, create a new one
            if (!donor) {
                console.log(`Creating NEW donor record...`);
                
                // Parse name from ClientName 
                // The format appears to be Hebrew name, so we'll need to handle it differently
                const fullName = donation.ClientName ? donation.ClientName.trim() : '';
                let firstName = '';
                let lastName = '';
                
                // Simple name parsing logic - can be improved later
                const nameParts = fullName.split(' ').filter(part => part.trim() !== '');
                if (nameParts.length >= 2) {
                    // In Hebrew names, last name often comes first
                    lastName = nameParts[0];
                    firstName = nameParts.slice(1).join(' ');
                } else if (nameParts.length === 1) {
                    firstName = nameParts[0];
                }
                
                // Create donor data directly without using Mongoose models
                const donorData = {
                    nedarim_id: [donation.Zeout || ''],
                    platform_type: ["nedarim"],
                    fName: firstName,
                    lName: lastName,
                    status: "To Contact"
                };
                
                // Only add Zeout to nedarim_id if it's not empty
                if (!donation.Zeout || donation.Zeout === '') {
                    donorData.nedarim_id = [];
                }
                
                // Add email if available
                if (donation.Mail) {
                    donorData.email_1 = {
                        email: donation.Mail,
                        isSubscribed: true
                    };
                }
                
                // Add phone if available
                if (donation.Phone) {
                    donorData.phone_number_1 = {
                        number: donation.Phone,
                        country: "IL", // Default to Israel for Nedarim
                        is_whatsapp: "unknown",
                        isSubscribed: true
                    };
                }
                
                // Use direct MongoDB insert to bypass Mongoose hooks
                donor = await directInsertDonor(donorData);
                
                console.log(`   Name: ${firstName} ${lastName}`);
                console.log(`   Contact: ${donation.Mail || 'no email'}, ${donation.Phone || 'no phone'}`);
                console.log(`   Zeout ID: ${donation.Zeout || 'none'}`);
            } else {
                console.log(`Updating EXISTING donor record...`);
                
                // Create an update object
                const updateData = {};
                let updated = false;
                
                // Check if this Zeout ID needs to be added (if not empty and not already in the array)
                if (donation.Zeout && donation.Zeout !== '') {
                    if (!donor.nedarim_id || !donor.nedarim_id.includes(donation.Zeout)) {
                        const nedarim_id = donor.nedarim_id || [];
                        nedarim_id.push(donation.Zeout);
                        updateData.nedarim_id = nedarim_id;
                        updated = true;
                        console.log(`Added Nedarim ID ${donation.Zeout} to existing donor`);
                    } else {
                        console.log(`Nedarim ID ${donation.Zeout} already exists for this donor`);
                    }
                }
                
                // Add platform_type "nedarim" if not already present
                if (!donor.platform_type || !donor.platform_type.includes("nedarim")) {
                    const platform_type = donor.platform_type || [];
                    platform_type.push("nedarim");
                    updateData.platform_type = platform_type;
                    updated = true;
                    console.log(`Added platform_type "nedarim" to existing donor`);
                } else {
                    console.log(`platform_type "nedarim" already exists for this donor`);
                }
                
                // Handle email - add to next available slot if it's a new email
                if (donation.Mail) {
                    let emailExists = false;
                    let availableSlot = null;
                    
                    // Check if this email already exists in any slot
                    for (let i = 1; i <= 3; i++) {
                        const emailObj = donor[`email_${i}`];
                        if (emailObj && emailObj.email === donation.Mail) {
                            emailExists = true;
                            console.log(`Email "${donation.Mail}" already exists in slot ${i}`);
                            break;
                        }
                        // Keep track of first available slot
                        if (!availableSlot && (!emailObj || !emailObj.email)) {
                            availableSlot = i;
                        }
                    }
                    
                    console.log(`Email check - Exists: ${emailExists}, Available slot: ${availableSlot || 'none'}`);
                    
                    // If email doesn't exist and we found an available slot, add it
                    if (!emailExists && availableSlot) {
                        updateData[`email_${availableSlot}`] = {
                            email: donation.Mail,
                            isSubscribed: true
                        };
                        updated = true;
                        console.log(`✅ Added new email "${donation.Mail}" to slot ${availableSlot}`);
                    } else if (!emailExists && !availableSlot) {
                        console.log(`⚠️ Could not add email "${donation.Mail}" - no slots available`);
                    }
                }
                
                // Handle phone - add to next available slot if it's a new phone
                if (donation.Phone) {
                    let phoneExists = false;
                    let availableSlot = null;
                    
                    // Check if this phone already exists in any slot
                    for (let i = 1; i <= 3; i++) {
                        const phoneObj = donor[`phone_number_${i}`];
                        if (phoneObj && phoneObj.number === donation.Phone) {
                            phoneExists = true;
                            console.log(`Phone "${donation.Phone}" already exists in slot ${i}`);
                            break;
                        }
                        // Keep track of first available slot
                        if (!availableSlot && (!phoneObj || !phoneObj.number)) {
                            availableSlot = i;
                        }
                    }
                    
                    console.log(`Phone check - Exists: ${phoneExists}, Available slot: ${availableSlot || 'none'}`);
                    
                    // If phone doesn't exist and we found an available slot, add it
                    if (!phoneExists && availableSlot) {
                        updateData[`phone_number_${availableSlot}`] = {
                            number: donation.Phone,
                            country: "IL", // Assuming Israel as default for Nedarim
                            is_whatsapp: "unknown",
                            isSubscribed: true
                        };
                        updated = true;
                        console.log(`✅ Added new phone "${donation.Phone}" to slot ${availableSlot}`);
                    } else if (!phoneExists && !availableSlot) {
                        console.log(`⚠️ Could not add phone "${donation.Phone}" - no slots available`);
                    }
                }
                
                // Update the donor if changes were made
                if (updated) {
                    // Use direct MongoDB update to bypass Mongoose hooks
                    donor = await directUpdateDonor(donor._id, updateData);
                    if (!donor) {
                        console.log(`⚠️ Failed to update donor, using original data`);
                        // If update failed, revert to original donor data
                    }
                } else {
                    console.log(`ℹ️ No changes needed for donor with ID: ${donor._id}`);
                }
            }
            
            // Now create donation record
            if (donor) {
                console.log(`📝 Creating donation record for TransactionId: ${donation.TransactionId}`);
                
                // Parse donation date
                let donationDate;
                try {
                    // Example format: "11/03/2024 13:25:00"
                    const [datePart, timePart] = donation.TransactionTime.split(' ');
                    const [day, month, year] = datePart.split('/');
                    donationDate = new Date(`${year}-${month}-${day}T${timePart}`);
                    
                    if (isNaN(donationDate.getTime())) {
                        console.warn(`⚠️ Invalid date format: ${donation.TransactionTime}, using current date`);
                        donationDate = new Date();
                    }
                } catch (dateError) {
                    console.warn(`⚠️ Error parsing date: ${dateError.message}, using current date`);
                    donationDate = new Date();
                }
                
                // Determine payment method based on available fields
                const paymentMethod = donation.TransactionType === "הו\"ק" ? "standing_order" : "credit_card";
                
                // Create the donation data object
                const donationData = {
                    donator_id: donor._id,
                    amount: parseFloat(donation.Amount) || 0,
                    currency: getCurrencyName(donation.Currency),
                    for_campaign: false, // Default value, adjust if needed
                    euro_amount: null, // Would need currency conversion logic
                    date: donationDate,
                    method: paymentMethod,
                    notes: donation.Comments || '',
                    transaction_id: donation.Confirmation || '',
                    cerfa: donation.Shovar || '', // Using Shovar as cerfa reference 
                    infos: {
                        // Store all original fields for reference
                        original: donation,
                        // Add any specific extracted fields
                        address: donation.Adresse || '',
                        transactionType: donation.TransactionType || '',
                        installments: donation.Tashloumim || '1'
                    },
                    type: 'donation', // Default donation type
                    remoteDonationId: donation.TransactionId, // Use TransactionId as unique identifier
                    platform: 'nedarim'
                };
                
                // Insert the donation record
                const savedDonation = await directInsertDonation(donationData);
                
                if (savedDonation) {
                    processedDonations.push({
                        donor: donor,
                        donation: savedDonation
                    });
                    console.log(`✅ Created donation record: ${donation.Amount} ${getCurrencyName(donation.Currency)} (ID: ${savedDonation._id})`);
                } else {
                    console.log(`ℹ️ Donation already exists or failed to save, skipping`);
                    processedDonations.push({
                        donor: donor,
                        donation: null
                    });
                }
            } else {
                console.error(`❌ Cannot create donation: No valid donor record`);
            }
            
        } catch (error) {
            console.error(`❌ ERROR processing donation ${donation.TransactionId}:`, error.message);
            // Continue with next donation even if there's an error
        }
    }

    console.log(`\n========== SYNC PROCESS COMPLETED ==========`);
    console.log(`Successfully processed ${processedDonations.length} of ${nedarimDonations.length} donations`);
    return processedDonations;
};

// Helper function to get currency name
function getCurrencyName(currencyCode) {
    const currencies = {
        "1": "NIS", // New Israeli Shekel
        // Add other currency codes as needed
    };
    
    return currencies[currencyCode] || currencyCode;
}

// Main sync function
const syncNedarimDonations = async () => {
    try {
        console.log(`\n\n===============================================`);
        console.log(`🔄 STARTING NEDARIM SYNC PROCESS: ${new Date().toISOString()}`);
        console.log(`===============================================\n`);
        
        console.log(`Step 1: Fetching donations from Nedarim API...`);
        const startFetch = Date.now();
        const nedarimDonations = await fetchNedarimDonations();
        const fetchTime = ((Date.now() - startFetch) / 1000).toFixed(2);
        console.log(`✅ Fetched ${nedarimDonations.length} Nedarim donations in ${fetchTime}s`);

        console.log(`\nStep 2: Processing donations and syncing donors to database...`);
        const startProcess = Date.now();
        const processedDonations = await processAndSaveDonations(nedarimDonations);
        const processTime = ((Date.now() - startProcess) / 1000).toFixed(2);
        console.log(`✅ Processed ${processedDonations.length} donations in ${processTime}s`);

        const totalTime = ((Date.now() - startFetch) / 1000).toFixed(2);
        console.log(`\n===============================================`);
        console.log(`✅ SYNC COMPLETED: ${new Date().toISOString()}`);
        console.log(`Total time: ${totalTime}s`);
        console.log(`===============================================\n`);

        return processedDonations;
    } catch (error) {
        console.error(`\n❌ ERROR SYNCING NEDARIM DONATIONS:`, error.message);
        console.log(`===============================================`);
        console.log(`❌ SYNC FAILED: ${new Date().toISOString()}`);
        console.log(`===============================================\n`);
        throw error;
    }
};

// Export the functions
module.exports = {
    fetchNedarimDonations,
    syncNedarimDonations,
    processAndSaveDonations
};

// Run as standalone script
if (require.main === module) {
    console.log('Running syncNedarim.js as a standalone script...');
    
    // Self-executing async function to run the script
    (async () => {
        try {
            // Make sure MongoDB is connected before starting
            await ensureMongoDBConnection();
            
            // Run the sync process
            await syncNedarimDonations();
            
            console.log('\n✅ Script completed successfully');
            
            // Close MongoDB connection cleanly
            console.log('Closing MongoDB connection...');
            await mongoose.connection.close();
            
            // Exit successfully
            process.exit(0);
        } catch (error) {
            console.error('\n❌ Script failed with error:', error.message);
            
            // Try to close MongoDB connection
            try {
                if (mongoose.connection.readyState !== 0) {
                    console.log('Closing MongoDB connection...');
                    await mongoose.connection.close();
                }
            } catch (err) {
                console.error('Error closing MongoDB connection:', err.message);
            }
            
            // Exit with error
            process.exit(1);
        }
    })();
} 