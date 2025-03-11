// This Script is in charge of syncing the Allodon clients with our database

const axios = require("axios");
const Donor = require("../models/Donor");
const Notification = require("../models/Notification");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

// Hardcoded configuration (will be added to .gitignore later)
const CONFIG = {
    // Database connection string
    MONGODB_URI: "mongodb+srv://lironefit:4YrMTTViFjGfG0yf@cluster0.e2j9t.mongodb.net/crm-data?retryWrites=true&w=majority&appName=Cluster0",
    
    // Allodon API token
    ALLODON_API_TOKEN: "3b5991b050cccd22c8ee444eb13e38219525851aff629127162962003d2d3e66716ad4d3a100f799317759eb3e"
};

// Log configuration (reduced)
console.log('Using hardcoded configuration');
console.log(`📊 Database: ${CONFIG.MONGODB_URI.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@')}`);

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
                    }
                    
                    console.log('✅ Mongoose hooks and automatic population disabled');
                } catch (hookError) {
                    console.warn('⚠️ Could not fully disable Mongoose hooks:', hookError.message);
                }
                
            } catch (error) {
                console.error(`❌ MongoDB connection error:`, error);
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
            }
        } catch (hookError) {
            console.warn('⚠️ Could not fully disable Mongoose hooks:', hookError.message);
        }
    }
};

// Step 1: Fetch Allodon clients
const fetchAllodonClients = async () => {
    try {
        console.log(`🔍 Fetching donors from Allodon API...`);
        
        // Set up authorization headers with bearer token
        const headers = {
            'Authorization': `Bearer ${CONFIG.ALLODON_API_TOKEN}`
        };
        
        const startTime = Date.now();
        const response = await axios.get(
            `https://www.allodons.fr/api/data/les-enfants-de-rachi/donors?page=1&per_page=10000`, 
            { headers }
        ); // Fetching the first 10000 clients which is basically all of them
        const fetchTime = ((Date.now() - startTime) / 1000).toFixed(2);
        
        console.log(`✅ API Response received in ${fetchTime}s (Status: ${response.status})`);
        
        // Validate the response data
        if (!response.data || !response.data.donateurs || !Array.isArray(response.data.donateurs)) {
            console.error(`❌ Invalid API response format`);
            throw new Error("Invalid API response format");
        }
        
        // Log data summary
        if (response.data.donateurs.length > 0) {
            const donorsWithNoEmail = response.data.donateurs.filter(d => !d.email).length;
            const donorsWithNoPhone = response.data.donateurs.filter(d => !d.phone).length;
            
            console.log(`📊 Data summary: ${response.data.donateurs.length} donors retrieved`);
        }
        
        return response.data;
    } catch (error) {
        console.error("❌ Error fetching Allodon clients:", error);
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
        }
        throw error;
    }
};

// Step 2: Sync the clients with our database
const syncAllodonClients = async () => {
    try {
        console.log(`\n===============================================`);
        console.log(`🔄 STARTING ALLODON SYNC: ${new Date().toISOString()}`);
        console.log(`===============================================`);
        
        const startFetch = Date.now();
        const allodonClients = await fetchAllodonClients();
        const fetchTime = ((Date.now() - startFetch) / 1000).toFixed(2);
        console.log(`✅ Fetched ${allodonClients.donateurs.length} Allodon clients in ${fetchTime}s`);

        const startProcess = Date.now();
        const processedClients = await processAndSaveClients(allodonClients);
        const processTime = ((Date.now() - startProcess) / 1000).toFixed(2);
        console.log(`✅ Processed ${processedClients.length} clients in ${processTime}s`);

        const totalTime = ((Date.now() - startFetch) / 1000).toFixed(2);
        console.log(`\n===============================================`);
        console.log(`✅ SYNC COMPLETED: ${new Date().toISOString()} (${totalTime}s)`);
        console.log(`===============================================`);

        return processedClients;
    } catch (error) {
        console.error(`\n❌ ERROR SYNCING ALLODON CLIENTS:`, error);
        console.log(`===============================================`);
        console.log(`❌ SYNC FAILED: ${new Date().toISOString()}`);
        console.log(`===============================================`);
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
        
        // Return the inserted document with its ID
        return { 
            _id: result.insertedId,
            ...donorData
        };
    } catch (error) {
        console.error('❌ Error directly inserting donor:', error);
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
        
        // Get the updated document
        const updatedDonor = await donorCollection.findOne({ _id: new mongoose.Types.ObjectId(donorId) });
        return updatedDonor;
    } catch (error) {
        console.error('❌ Error directly updating donor:', error);
        throw error;
    }
};

// Step 4: Process and save clients to our database
const processAndSaveClients = async (allodonClients) => {
    const processedClients = [];
    console.log(`Processing ${allodonClients.donateurs.length} clients...`);

    // List of fields we need from the Donor model (to avoid automatic population)
    const selectFields = 'fName lName allo_dons_id nedarim_id platform_type email_1 email_2 email_3 phone_number_1 phone_number_2 phone_number_3 status';
    
    // Track already processed client IDs to avoid duplicates
    const processedIds = new Set();
    let newCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const client of allodonClients.donateurs) {
        try {
            // Skip if we've already processed a client with this ID
            if (processedIds.has(client.id)) {
                console.log(`Client ${client.first_name} ${client.last_name} (ID: ${client.id}): Skipped - duplicate ID`);
                skippedCount++;
                continue;
            }
            
            // Add this ID to our processed set
            processedIds.add(client.id);
            
            // First check if donor exists by Allodon ID - use lean() and specific field selection to avoid references
            let donor = await Donor.findOne({ allo_dons_id: client.id })
                .select(selectFields)
                .lean();
                
            // If not found by ID, check if donor exists by email or phone
            if (!donor && (client.email || client.phone)) {
                const query = { $or: [] };
                
                if (client.email) {
                    // Check all three email fields
                    for (let i = 1; i <= 3; i++) {
                        query.$or.push({ [`email_${i}.email`]: client.email });
                    }
                }
                
                if (client.phone) {
                    // Check all three phone fields
                    for (let i = 1; i <= 3; i++) {
                        query.$or.push({ [`phone_number_${i}.number`]: client.phone });
                    }
                }
                
                // Only run the query if we have conditions
                if (query.$or.length > 0) {
                    donor = await Donor.findOne(query)
                        .select(selectFields)
                        .lean();
                }
            }
            
            if (!donor) {
                // Create donor data directly without using Mongoose models
                const donorData = {
                    allo_dons_id: [client.id],
                    platform_type: ["allodon"],
                    fName: client.first_name,
                    lName: client.last_name,
                    status: "To Contact"
                };
                
                // Add email if available
                if (client.email) {
                    donorData.email_1 = {
                        email: client.email,
                        isSubscribed: true
                    };
                }
                
                // Add phone if available
                if (client.phone) {
                    donorData.phone_number_1 = {
                        number: client.phone,
                        country: "FR",
                        is_whatsapp: "unknown",
                        isSubscribed: true
                    };
                }
                
                // Use direct MongoDB insert to bypass Mongoose hooks
                const newDonor = await directInsertDonor(donorData);
                processedClients.push(newDonor);
                newCount++;
                console.log(`Client ${client.first_name} ${client.last_name} (ID: ${client.id}): Added as new donor`);
            } else {
                // Create an update object
                const updateData = {};
                let updated = false;
                
                // Check if this Allodon ID is already in the array
                if (!donor.allo_dons_id || !donor.allo_dons_id.includes(client.id)) {
                    const allo_dons_id = donor.allo_dons_id || [];
                    allo_dons_id.push(client.id);
                    updateData.allo_dons_id = allo_dons_id;
                    updated = true;
                }
                
                // Update other fields only if they're empty or if Allodon data is newer/better
                if (!donor.fName && client.first_name) {
                    updateData.fName = client.first_name;
                    updated = true;
                }
                
                if (!donor.lName && client.last_name) {
                    updateData.lName = client.last_name;
                    updated = true;
                }
                
                // Add platform_type "allodon" if not already present
                if (!donor.platform_type || !donor.platform_type.includes("allodon")) {
                    const platform_type = donor.platform_type || [];
                    platform_type.push("allodon");
                    updateData.platform_type = platform_type;
                    updated = true;
                }
                
                // Handle email - add to next available slot if it's a new email
                if (client.email) {
                    let emailExists = false;
                    let availableSlot = null;
                    
                    // Check if this email already exists in any slot
                    for (let i = 1; i <= 3; i++) {
                        const emailObj = donor[`email_${i}`];
                        if (emailObj && emailObj.email === client.email) {
                            emailExists = true;
                            break;
                        }
                        // Keep track of first available slot
                        if (!availableSlot && (!emailObj || !emailObj.email)) {
                            availableSlot = i;
                        }
                    }
                    
                    // If email doesn't exist and we found an available slot, add it
                    if (!emailExists && availableSlot) {
                        updateData[`email_${availableSlot}`] = {
                            email: client.email,
                            isSubscribed: true
                        };
                        updated = true;
                    }
                }
                
                // Handle phone - add to next available slot if it's a new phone
                if (client.phone) {
                    let phoneExists = false;
                    let availableSlot = null;
                    
                    // Check if this phone already exists in any slot
                    for (let i = 1; i <= 3; i++) {
                        const phoneObj = donor[`phone_number_${i}`];
                        if (phoneObj && phoneObj.number === client.phone) {
                            phoneExists = true;
                            break;
                        }
                        // Keep track of first available slot
                        if (!availableSlot && (!phoneObj || !phoneObj.number)) {
                            availableSlot = i;
                        }
                    }
                    
                    // If phone doesn't exist and we found an available slot, add it
                    if (!phoneExists && availableSlot) {
                        updateData[`phone_number_${availableSlot}`] = {
                            number: client.phone,
                            country: "FR", // Assuming France as default
                            is_whatsapp: "unknown",
                            isSubscribed: true
                        };
                        updated = true;
                    }
                }
                
                // Update the donor if changes were made
                if (updated) {
                    // Use direct MongoDB update to bypass Mongoose hooks
                    const updatedDonor = await directUpdateDonor(donor._id, updateData);
                    if (updatedDonor) {
                        processedClients.push(updatedDonor);
                        updatedCount++;
                        console.log(`Client ${client.first_name} ${client.last_name} (ID: ${client.id}): Updated existing donor`);
                    }
                } else {
                    processedClients.push(donor);
                    skippedCount++;
                    console.log(`Client ${client.first_name} ${client.last_name} (ID: ${client.id}): Already exists (no changes)`);
                }
            }
        } catch (error) {
            console.error(`Client ${client.first_name} ${client.last_name} (ID: ${client.id}): Error - ${error.message}`);
            errorCount++;
            // Continue with next client even if there's an error
        }
    }

    console.log(`Sync summary: ${newCount} new, ${updatedCount} updated, ${skippedCount} unchanged, ${errorCount} errors`);
    return processedClients;
};


// Export the functions
module.exports = {
    fetchAllodonClients,
    syncAllodonClients,
    processAndSaveClients
};

// Run as standalone script
if (require.main === module) {
    console.log('Running syncAllodon.js as a standalone script...');
    
    // Self-executing async function to run the script
    (async () => {
        try {
            // Make sure MongoDB is connected before starting
            await ensureMongoDBConnection();
            
            // Run the sync process
            await syncAllodonClients();
            
            console.log('\n✅ Script completed successfully');
            
            // Close MongoDB connection cleanly
            console.log('Closing MongoDB connection...');
            await mongoose.connection.close();
            
            // Exit successfully
            process.exit(0);
        } catch (error) {
            console.error('\n❌ Script failed with error:', error);
            
            // Try to close MongoDB connection
            try {
                if (mongoose.connection.readyState !== 0) {
                    console.log('Closing MongoDB connection...');
                    await mongoose.connection.close();
                }
            } catch (err) {
                console.error('Error closing MongoDB connection:', err);
            }
            
            // Exit with error
            process.exit(1);
        }
    })();
}

    