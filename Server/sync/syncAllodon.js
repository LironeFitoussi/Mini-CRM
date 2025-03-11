// This Script is in charge of syncing the Allodon clients with our database

const axios = require("axios");
const Donor = require("../models/Donor");
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

// Log configuration
console.log('Using hardcoded configuration:');
console.log(`📊 Database: ${CONFIG.MONGODB_URI.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@')}`);
const token = CONFIG.ALLODON_API_TOKEN;
const firstChars = token.substring(0, 6);
const lastChars = token.substring(token.length - 4);
console.log(`🔑 API Token: ${firstChars}...${lastChars}`);

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

// Step 1: Fetch Allodon clients
const fetchAllodonClients = async () => {
    try {
        console.log(`🔍 Fetching donors from Allodon API...`);
        console.log(`API URL: https://www.allodons.fr/api/data/les-enfants-de-rachi/donors?page=1&per_page=10000`);
        
        // Set up authorization headers with bearer token
        const headers = {
            'Authorization': `Bearer ${CONFIG.ALLODON_API_TOKEN}`
        };
        
        console.log(`🔐 Using bearer token authentication`);
        
        const startTime = Date.now();
        const response = await axios.get(
            `https://www.allodons.fr/api/data/les-enfants-de-rachi/donors?page=1&per_page=10000`, 
            { headers }
        ); // Fetching the first 10000 clients which is basically all of them
        const fetchTime = ((Date.now() - startTime) / 1000).toFixed(2);
        
        console.log(`✅ API Response received in ${fetchTime}s`);
        console.log(`Status: ${response.status} ${response.statusText}`);
        
        // Validate the response data
        if (!response.data || !response.data.donateurs || !Array.isArray(response.data.donateurs)) {
            console.error(`❌ Invalid API response format:`);
            console.error(JSON.stringify(response.data, null, 2).substring(0, 500) + '...');
            throw new Error("Invalid API response format");
        }
        
        // Log data sample (first donor for debugging)
        if (response.data.donateurs.length > 0) {
            console.log(`📊 Sample donor data (first record):`);
            console.log(JSON.stringify(response.data.donateurs[0], null, 2));
            
            // Check for data quality issues
            const donorsWithNoEmail = response.data.donateurs.filter(d => !d.email).length;
            const donorsWithNoPhone = response.data.donateurs.filter(d => !d.phone).length;
            const donorsWithNoEmailOrPhone = response.data.donateurs.filter(d => !d.email && !d.phone).length;
            
            console.log(`📊 Data quality check:`);
            console.log(`- Total donors: ${response.data.donateurs.length}`);
            console.log(`- Donors with no email: ${donorsWithNoEmail} (${((donorsWithNoEmail/response.data.donateurs.length)*100).toFixed(1)}%)`);
            console.log(`- Donors with no phone: ${donorsWithNoPhone} (${((donorsWithNoPhone/response.data.donateurs.length)*100).toFixed(1)}%)`);
            console.log(`- Donors with neither email nor phone: ${donorsWithNoEmailOrPhone} (${((donorsWithNoEmailOrPhone/response.data.donateurs.length)*100).toFixed(1)}%)`);
        }
        
        return response.data;
    } catch (error) {
        console.error("❌ Error fetching Allodon clients:", error);
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Headers: ${JSON.stringify(error.response.headers)}`);
            console.error(`Data: ${JSON.stringify(error.response.data).substring(0, 500)}`);
        } else if (error.request) {
            console.error(`No response received. Request: ${JSON.stringify(error.request).substring(0, 500)}`);
        } else {
            console.error(`Error message: ${error.message}`);
        }
        throw error;
    }
};

// Exmaple of the response
// {
//     "donateurs": [
//         {
//             "id": 6547798,
//             "is_company": false,
//             "company_name": null,
//             "gender": "f",
//             "first_name": "AZRIA ",
//             "last_name": "Noa",
//             "email": "dahannoa930@gmail.com",
//             "phone": "+33641665569",
//             "address": "5 rue Eugène ringuet ",
//             "zip_code": "94160",
//             "city": "SAINT MANDÉ ",
//             "pseudo": "Anonyme",
//             "siren": ""
//         }
//         ...
//     ]   
//     }

// Step 2: Sync the clients with our database
const syncAllodonClients = async () => {
    try {
        console.log(`\n\n===============================================`);
        console.log(`🔄 STARTING ALLODON SYNC PROCESS: ${new Date().toISOString()}`);
        console.log(`===============================================\n`);
        
        console.log(`Step 1: Fetching clients from Allodon API...`);
        const startFetch = Date.now();
        const allodonClients = await fetchAllodonClients();
        const fetchTime = ((Date.now() - startFetch) / 1000).toFixed(2);
        console.log(`✅ Fetched ${allodonClients.donateurs.length} Allodon clients in ${fetchTime}s`);

        console.log(`\nStep 2: Processing and saving clients to database with duplicate prevention...`);
        const startProcess = Date.now();
        const processedClients = await processAndSaveClients(allodonClients);
        const processTime = ((Date.now() - startProcess) / 1000).toFixed(2);
        console.log(`✅ Processed ${processedClients.length} clients in ${processTime}s`);

        const totalTime = ((Date.now() - startFetch) / 1000).toFixed(2);
        console.log(`\n===============================================`);
        console.log(`✅ SYNC COMPLETED: ${new Date().toISOString()}`);
        console.log(`Total time: ${totalTime}s`);
        console.log(`===============================================\n`);

        return processedClients;
    } catch (error) {
        console.error(`\n❌ ERROR SYNCING ALLODON CLIENTS:`, error);
        console.log(`===============================================`);
        console.log(`❌ SYNC FAILED: ${new Date().toISOString()}`);
        console.log(`===============================================\n`);
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
        
        console.log(`✅ Directly updated donor with ID: ${donorId}`);
        
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
    console.log(`========== STARTING SYNC PROCESS ==========`);
    console.log(`Total clients to process: ${allodonClients.donateurs.length}`);

    // List of fields we need from the Donor model (to avoid automatic population)
    const selectFields = 'fName lName allo_dons_id nedarim_id platform_type email_1 email_2 email_3 phone_number_1 phone_number_2 phone_number_3 status';
    
    // Track already processed client IDs to avoid duplicates
    const processedIds = new Set();

    for (const client of allodonClients.donateurs) {
        try {
            // Skip if we've already processed a client with this ID
            if (processedIds.has(client.id)) {
                console.log(`\n----- Skipping duplicate client with ID: ${client.id} -----`);
                console.log(`Already processed client ${client.first_name} ${client.last_name} with this ID`);
                continue;
            }
            
            // Add this ID to our processed set
            processedIds.add(client.id);
            
            console.log(`\n----- Processing client: ${client.first_name} ${client.last_name} (ID: ${client.id}) -----`);
            console.log(`Contact info - Email: ${client.email || 'none'}, Phone: ${client.phone || 'none'}`);
            
            // First check if donor exists by Allodon ID - use lean() and specific field selection to avoid references
            let donor = await Donor.findOne({ allo_dons_id: client.id })
                .select(selectFields)
                .lean();
                
            console.log(`Searching by Allodon ID ${client.id}: ${donor ? 'FOUND' : 'NOT FOUND'}`);
            
            // If not found by ID, check if donor exists by email or phone
            if (!donor && (client.email || client.phone)) {
                console.log(`Attempting to find by email or phone...`);
                const query = { $or: [] };
                
                if (client.email) {
                    // Check all three email fields
                    for (let i = 1; i <= 3; i++) {
                        query.$or.push({ [`email_${i}.email`]: client.email });
                    }
                    console.log(`Added email "${client.email}" to search query`);
                }
                
                if (client.phone) {
                    // Check all three phone fields
                    for (let i = 1; i <= 3; i++) {
                        query.$or.push({ [`phone_number_${i}.number`]: client.phone });
                    }
                    console.log(`Added phone "${client.phone}" to search query`);
                }
                
                // Only run the query if we have conditions
                if (query.$or.length > 0) {
                    donor = await Donor.findOne(query)
                        .select(selectFields)
                        .lean();
                        
                    console.log(`Search by contact info: ${donor ? 'FOUND MATCH' : 'NO MATCH'}`);
                    if (donor) {
                        console.log(`Matched donor: ${donor.fName} ${donor.lName} (ID: ${donor._id})`);
                    }
                }
            }
            
            if (!donor) {
                console.log(`Creating NEW donor record...`);
                
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
                
                console.log(`   Name: ${client.first_name} ${client.last_name}`);
                console.log(`   Contact: ${client.email || 'no email'}, ${client.phone || 'no phone'}`);
            } else {
                console.log(`Updating EXISTING donor record...`);
                
                // Create an update object
                const updateData = {};
                let updated = false;
                
                // Check if this Allodon ID is already in the array
                if (!donor.allo_dons_id || !donor.allo_dons_id.includes(client.id)) {
                    const allo_dons_id = donor.allo_dons_id || [];
                    allo_dons_id.push(client.id);
                    updateData.allo_dons_id = allo_dons_id;
                    updated = true;
                    console.log(`Added Allodon ID ${client.id} to existing donor`);
                } else {
                    console.log(`Allodon ID ${client.id} already exists for this donor`);
                }
                
                // Update other fields only if they're empty or if Allodon data is newer/better
                if (!donor.fName && client.first_name) {
                    updateData.fName = client.first_name;
                    updated = true;
                    console.log(`Updated first name to "${client.first_name}"`);
                }
                
                if (!donor.lName && client.last_name) {
                    updateData.lName = client.last_name;
                    updated = true;
                    console.log(`Updated last name to "${client.last_name}"`);
                }
                
                // Add platform_type "allodon" if not already present
                if (!donor.platform_type || !donor.platform_type.includes("allodon")) {
                    const platform_type = donor.platform_type || [];
                    platform_type.push("allodon");
                    updateData.platform_type = platform_type;
                    updated = true;
                    console.log(`Added platform_type "allodon" to existing donor`);
                } else {
                    console.log(`platform_type "allodon" already exists for this donor`);
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
                            console.log(`Email "${client.email}" already exists in slot ${i}`);
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
                            email: client.email,
                            isSubscribed: true
                        };
                        updated = true;
                        console.log(`✅ Added new email "${client.email}" to slot ${availableSlot}`);
                    } else if (!emailExists && !availableSlot) {
                        console.log(`⚠️ Could not add email "${client.email}" - no slots available`);
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
                            console.log(`Phone "${client.phone}" already exists in slot ${i}`);
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
                            number: client.phone,
                            country: "FR", // Assuming France as default
                            is_whatsapp: "unknown",
                            isSubscribed: true
                        };
                        updated = true;
                        console.log(`✅ Added new phone "${client.phone}" to slot ${availableSlot}`);
                    } else if (!phoneExists && !availableSlot) {
                        console.log(`⚠️ Could not add phone "${client.phone}" - no slots available`);
                    }
                }
                
                // Update the donor if changes were made
                if (updated) {
                    // Use direct MongoDB update to bypass Mongoose hooks
                    const updatedDonor = await directUpdateDonor(donor._id, updateData);
                    if (updatedDonor) {
                        processedClients.push(updatedDonor);
                        console.log(`✅ Updated donor with ID: ${donor._id}`);
                    }
                } else {
                    console.log(`ℹ️ No changes needed for donor with ID: ${donor._id}`);
                    processedClients.push(donor);
                }
            }
        } catch (error) {
            console.error(`❌ ERROR processing donor ${client.id}:`, error);
            // Continue with next client even if there's an error
        }
    }

    console.log(`\n========== SYNC PROCESS COMPLETED ==========`);
    console.log(`Successfully processed ${processedClients.length} of ${allodonClients.donateurs.length} clients`);
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

    