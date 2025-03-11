const cron = require("node-cron");
const axios = require("axios");
const mongoose = require("mongoose");
const Donor = require("../models/Donor");
const Donation = require("../models/Donation");
const dotenv = require("dotenv");

dotenv.config();

// API Configuration
const ALLODON_API_TOKEN = "3b5991b050cccd22c8ee444eb13e38219525851aff629127162962003d2d3e66716ad4d3a100f799317759eb3e";
const ALLODON_DONATIONS_URL = "http://www.allodons.fr/api/data/les-enfants-de-rachi/donations";
const ALLODON_DONOR_BASE_URL = "http://www.allodons.fr/api/data/les-enfants-de-rachi/donors";

// Nedarim API configuration (from syncNedarim.js)
const NEDARIM_CONFIG = {
    API_URL: "https://matara.pro/nedarimplus/Reports/Manage3.aspx",
    MOSAD_ID: "7011486",
    API_PASSWORD: "tp193"
};

// Utility function to get date 24 hours ago in YYYY-MM-DD format
const get24HoursAgoDate = () => {
    const date = new Date();
    date.setHours(date.getHours() - 24);
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
};

// Utility function to check if a date is within the last 24 hours
const isWithinLast24Hours = (dateString) => {
    const date = new Date(dateString);
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    return date >= twentyFourHoursAgo;
};

// Ensure MongoDB connection
const ensureMongoDBConnection = async () => {
    if (mongoose.connection.readyState !== 1) {
        console.log(`🔌 MongoDB not connected (state: ${mongoose.connection.readyState}). Attempting to connect...`);
        
        if (mongoose.connection.readyState !== 2) {
            try {
                const options = {
                    serverSelectionTimeoutMS: 30000,
                    socketTimeoutMS: 45000,
                    connectTimeoutMS: 30000,
                    maxPoolSize: 50
                };
                
                await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://lironefit:4YrMTTViFjGfG0yf@cluster0.e2j9t.mongodb.net/crm-data?retryWrites=true&w=majority&appName=Cluster0", options);
                console.log(`✅ MongoDB connected successfully`);
            } catch (error) {
                console.error(`❌ MongoDB connection error:`, error);
                throw error;
            }
        } else {
            console.log(`⏳ MongoDB is connecting, waiting...`);
            // Wait for connection to complete
            await new Promise(resolve => {
                const checkConnection = setInterval(() => {
                    if (mongoose.connection.readyState === 1) {
                        clearInterval(checkConnection);
                        resolve();
                    }
                }, 500);
            });
            console.log(`✅ MongoDB connected successfully`);
        }
    }
};

// Add getCurrencyName function from syncNedarim.js
function getCurrencyName(currencyCode) {
    const currencyMap = {
        'ILS': 'ILS',
        'USD': 'USD',
        'EUR': 'EUR',
        // Add more currency mappings as needed
    };
    return currencyMap[currencyCode] || currencyCode || 'ILS';
}

// PART 1: NEDARIM SYNC FUNCTIONS

// Fetch donations from Nedarim API
const fetchNedarimDonations = async () => {
    try {
        console.log(`🔍 Fetching donations from Nedarim API...`);
        console.log(`API URL: ${NEDARIM_CONFIG.API_URL.replace(/ApiPassword=([^&]+)/, 'ApiPassword=****')}`);
        
        const params = {
            Action: "GetHistoryJson",
            MosadId: NEDARIM_CONFIG.MOSAD_ID,
            ApiPassword: NEDARIM_CONFIG.API_PASSWORD
        };
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        const startTime = Date.now();
        const response = await axios.get(NEDARIM_CONFIG.API_URL, { params, headers });
        const fetchTime = ((Date.now() - startTime) / 1000).toFixed(2);
        
        console.log(`✅ API Response received in ${fetchTime}s`);
        console.log(`Status: ${response.status} ${response.statusText}`);
        
        if (!response.data || !Array.isArray(response.data)) {
            console.error(`❌ Invalid API response format:`);
            console.error(JSON.stringify(response.data).substring(0, 500) + '...');
            throw new Error("Invalid response from Nedarim API");
        }
        
        // Log data sample (first donation for debugging)
        if (response.data.length > 0) {
            console.log(`📊 Sample donation data (first record):`);
            console.log(JSON.stringify(response.data[0], null, 2));
            
            // Check for data quality issues
            const donorsWithNoEmail = response.data.filter(d => !d.Mail).length;
            const donorsWithNoPhone = response.data.filter(d => !d.Phone).length;
            console.log(`📊 Data quality: ${donorsWithNoEmail} donors with no email, ${donorsWithNoPhone} with no phone`);
        }
        
        console.log(`✅ Fetched ${response.data.length} donations from Nedarim API`);
        return response.data;
    } catch (error) {
        console.error(`❌ Error fetching Nedarim donations:`, error);
        throw error;
    }
};

// Process and save Nedarim donations from the last 24 hours
const processNedarimDonations = async () => {
    try {
        await ensureMongoDBConnection();
        
        // 1. Fetch all donations from Nedarim
        const allNedarimDonations = await fetchNedarimDonations();
        
        // 2. Filter donations from the last 24 hours
        const recentDonations = allNedarimDonations.filter(donation => {
            // Parse donation date
            let donationDate;
            try {
                // Example format: "11/03/2024 13:25:00"
                const [datePart, timePart] = donation.TransactionTime ? donation.TransactionTime.split(' ') : [donation.Date, ''];
                if (datePart && datePart.includes('/')) {
                    const [day, month, year] = datePart.split('/');
                    donationDate = new Date(`${year}-${month}-${day}${timePart ? `T${timePart}` : ''}`);
                } else {
                    donationDate = new Date(donation.Date);
                }
                
                if (isNaN(donationDate.getTime())) {
                    console.warn(`⚠️ Invalid date format: ${donation.TransactionTime || donation.Date}, using current date`);
                    donationDate = new Date();
                }
            } catch (dateError) {
                console.warn(`⚠️ Error parsing date: ${dateError.message}, using current date`);
                donationDate = new Date();
            }

            console.log(donationDate);
            
            return isWithinLast24Hours(donationDate);
        });
        
        console.log(`🕒 Found ${recentDonations.length} Nedarim donations from the last 24 hours`);
        
        // 3. Process each donation
        let newDonorsCount = 0;
        let newDonationsCount = 0;
        
        for (const donation of recentDonations) {
            // Check if donation already exists
            console.log(donation);
            
            const remoteDonationId = donation.Zeout.toString() || donation.Mail.toString() || donation.Number.toString();
            const existingDonation = await Donation.findOne({ 
                platform: "nedarim", 
                remoteDonationId: remoteDonationId 
            });
            
            if (existingDonation) {
                console.log(`⏩ Skipping existing Nedarim donation: ${donation.Id}`);
                continue;
            }
            
            // Try to find existing donor by ID or email
            let donor = null;
            
            // First try to find by Nedarim ID (Zeut)
            if (donation.Zeut || donation.Zeout) {
                const idToCheck = donation.Zeut || donation.Zeout;
                donor = await Donor.findOne({
                    $or: [
                        { nedarim_id: idToCheck }, // Check in array
                        { nedarimId: idToCheck },  // Check in string field (legacy)
                        { idNumber: idToCheck }
                    ]
                });
                console.log(`Searching by ID ${idToCheck}: ${donor ? 'FOUND' : 'NOT FOUND'}`);
            }
            
            // If not found by ID, try email
            if (!donor && (donation.Email || donation.Mail)) {
                const emailToCheck = donation.Email || donation.Mail;
                console.log(`Attempting to find by email...`);
                
                // Check both standard email field and structured email fields
                const query = { $or: [{ email: emailToCheck }] };
                
                // Check all three email fields (structured format)
                for (let i = 1; i <= 3; i++) {
                    query.$or.push({ [`email_${i}.email`]: emailToCheck });
                }
                
                donor = await Donor.findOne(query);
                console.log(`Search by email ${emailToCheck}: ${donor ? 'FOUND MATCH' : 'NO MATCH'}`);
            }
            
            // If still not found, try by phone
            if (!donor && (donation.Phone || donation.Telephone)) {
                const phoneToCheck = donation.Phone || donation.Telephone;
                console.log(`Attempting to find by phone...`);
                donor = await Donor.findOne({ phone: phoneToCheck });
                console.log(`Search by phone ${phoneToCheck}: ${donor ? 'FOUND MATCH' : 'NO MATCH'}`);
            }
            
            // If donor not found, create a new one
            if (!donor) {
                console.log(`➕ Creating new donor from Nedarim donation: ${donation.Id}`);
                
                // Parse name from ClientName if available
                const fullName = donation.ClientName ? donation.ClientName.trim() : '';
                let firstName = donation.FirstName || '';
                let lastName = donation.LastName || '';
                
                // If we have ClientName but not FirstName/LastName, parse it
                if (fullName && (!firstName || !lastName)) {
                    const nameParts = fullName.split(' ').filter(part => part.trim() !== '');
                    if (nameParts.length >= 2) {
                        // In Hebrew names, last name often comes first
                        lastName = nameParts[0];
                        firstName = nameParts.slice(1).join(' ');
                    } else if (nameParts.length === 1) {
                        firstName = nameParts[0];
                    }
                }
                
                const newDonor = new Donor({
                    firstName: firstName || "Unknown",
                    lastName: lastName || "Unknown",
                    fName: firstName || "Unknown", // Adding both field formats for compatibility
                    lName: lastName || "Unknown",  // Adding both field formats for compatibility
                    email: (donation.Email || donation.Mail || ""),
                    phone: (donation.Phone || donation.Telephone || ""),
                    address: (donation.Address || donation.Adresse || ""),
                    city: donation.City || "",
                    nedarim_id: (donation.Zeut || donation.Zeout) ? [(donation.Zeut || donation.Zeout)] : [], // Array format
                    nedarimId: (donation.Zeut || donation.Zeout) || "", // Keep for backward compatibility
                    idNumber: (donation.Zeut || donation.Zeout) || "",
                    platform_type: ["nedarim"],
                    source: "nedarim",
                    status: "To Contact",
                    isSubscribed: true
                });
                
                donor = await newDonor.save();
                newDonorsCount++;
            } else {
                // Update existing donor with any new information
                let updated = false;
                const updateData = {};
                
                // Check if this Zeut ID needs to be added (if not empty and not already in the array)
                const idToCheck = donation.Zeut || donation.Zeout;
                if (idToCheck && idToCheck !== '') {
                    if (!donor.nedarim_id || !donor.nedarim_id.includes(idToCheck)) {
                        const nedarim_id = donor.nedarim_id || [];
                        nedarim_id.push(idToCheck);
                        updateData.nedarim_id = nedarim_id;
                        updated = true;
                    }
                }
                
                // Add platform_type "nedarim" if not already present
                if (!donor.platform_type || !donor.platform_type.includes("nedarim")) {
                    const platform_type = donor.platform_type || [];
                    platform_type.push("nedarim");
                    updateData.platform_type = platform_type;
                    updated = true;
                }
                
                // Update the donor if changes were made
                if (updated) {
                    Object.assign(donor, updateData);
                    await donor.save();
                }
            }
            
            // Create the donation

            // Determine payment method based on available fields
            const paymentMethod = donation.TransactionType === "הו\"ק" ? "standing_order" : "credit_card";
            
            // Parse donation date
            let donationDate;
            try {
                // Example format: "11/03/2024 13:25:00"
                const [datePart, timePart] = donation.TransactionTime ? donation.TransactionTime.split(' ') : [donation.Date, ''];
                if (datePart && datePart.includes('/')) {
                    const [day, month, year] = datePart.split('/');
                    donationDate = new Date(`${year}-${month}-${day}${timePart ? `T${timePart}` : ''}`);
                } else {
                    donationDate = new Date(donation.Date);
                }
                
                if (isNaN(donationDate.getTime())) {
                    console.warn(`⚠️ Invalid date format: ${donation.TransactionTime || donation.Date}, using current date`);
                    donationDate = new Date();
                }
            } catch (dateError) {
                console.warn(`⚠️ Error parsing date: ${dateError.message}, using current date`);
                donationDate = new Date();
            }

            const newDonation = new Donation({
                donator_id: donor._id,
                amount: parseFloat(donation.Amount) || 0,
                currency: donation.Currency ? getCurrencyName(donation.Currency) : "ILS",
                date: donationDate,
                method: paymentMethod,
                platform: "nedarim",
                remoteDonationId: donation.TransactionId ? donation.TransactionId.toString() : '',
                notes: donation.Comments || "",
                transaction_id: donation.Confirmation || '',
                cerfa: donation.Shovar || '',
                for_campaign: donation.Campaign ? true : false,
                infos: {
                    campaign: donation.Campaign || "",
                    status: "completed",
                    original: donation,
                    address: donation.Adresse || '',
                    transactionType: donation.TransactionType || '',
                    installments: donation.Tashloumim || '1'
                }
            });
            
            await newDonation.save();
            newDonationsCount++;
        }
        
        console.log(`✅ Nedarim sync completed: ${newDonorsCount} new donors, ${newDonationsCount} new donations`);
        return { newDonors: newDonorsCount, newDonations: newDonationsCount };
    } catch (error) {
        console.error(`❌ Error processing Nedarim donations:`, error);
        throw error;
    }
};

// PART 2: ALLODON SYNC FUNCTIONS

// Fetch donations from Allodon API
const fetchAllodonDonations = async () => {
    try {
        const fromDate = get24HoursAgoDate();
        console.log(`🔍 Fetching Allodon donations from date: ${fromDate}...`);
        
        const response = await axios.get(ALLODON_DONATIONS_URL, {
            params: { 
                per_page: 10000,
                from: fromDate 
            },
            headers: { 
                Authorization: `Bearer ${ALLODON_API_TOKEN}` 
            }
        });
        
        if (!response.data || !response.data.dons || !Array.isArray(response.data.dons)) {
            throw new Error("Invalid response from Allodon API");
        }
        
        console.log(`✅ Fetched ${response.data.dons.length} donations from Allodon API`);
        return response.data.dons;
    } catch (error) {
        console.error(`❌ Error fetching Allodon donations:`, error);
        throw error;
    }
};

// Fetch donor details from Allodon API
const fetchAllodonDonorDetails = async (donorId) => {
    try {
        console.log(`🔍 Fetching Allodon donor details for ID: ${donorId}...`);
        
        const response = await axios.get(`${ALLODON_DONOR_BASE_URL}/${donorId}`, {
            headers: { 
                Authorization: `Bearer ${ALLODON_API_TOKEN}` 
            }
        });
        
        if (!response.data || !response.data.id) {
            throw new Error("Invalid donor data from Allodon API");
        }
        
        return response.data;
    } catch (error) {
        console.error(`❌ Error fetching Allodon donor details:`, error);
        throw error;
    }
};

// Process and save Allodon donations
const processAllodonDonations = async () => {
    try {
        await ensureMongoDBConnection();
        
        // 1. Fetch donations from the last 24 hours
        const recentDonations = await fetchAllodonDonations();
        
        // 2. Process each donation
        let newDonorsCount = 0;
        let newDonationsCount = 0;
        
        for (const donation of recentDonations) {
            // Check if donation already exists
            const existingDonation = await Donation.findOne({ 
                platform: "allodons", 
                remoteDonationId: donation.id.toString() 
            });
            
            if (existingDonation) {
                console.log(`⏩ Skipping existing Allodon donation: ${donation.id}`);
                continue;
            }
            
            // Look for donor by allodonId - use the correct field name from schema
            let donor = await Donor.findOne({ allo_dons_id: donation.donor_id.toString() });
            
            // If donor not found, fetch details and create a new one
            if (!donor) {
                console.log(`🔍 Donor not found, fetching details for donor ID: ${donation.donor_id}`);
                
                const donorDetails = await fetchAllodonDonorDetails(donation.donor_id);
                
                // Create new donor with correct schema fields
                const newDonor = new Donor({
                    fName: donorDetails.first_name || "Unknown",
                    lName: donorDetails.last_name || "Unknown",
                    allo_dons_id: [donorDetails.id.toString()],
                    platform_type: ["allodon"],
                    status: "To Contact",
                    // Add email if available
                    ...(donorDetails.email ? {
                        email_1: {
                            email: donorDetails.email,
                            isSubscribed: true
                        }
                    } : {}),
                    // Add phone if available
                    ...(donorDetails.phone ? {
                        phone_number_1: {
                            number: donorDetails.phone,
                            country: "FR",
                            is_whatsapp: "unknown",
                            isSubscribed: true
                        }
                    } : {})
                });
                
                donor = await newDonor.save();
                newDonorsCount++;
                console.log(`➕ Created new donor: ${donor._id} (Allodon ID: ${donorDetails.id})`);
            }
            
            // Create the donation with correct schema fields
            const newDonation = new Donation({
                donator_id: donor._id,
                amount: parseFloat(donation.euro_amount) || 0,
                currency: donation.currency || "€",
                date: new Date(donation.date),
                method: donation.mode || "Unknown",
                platform: "allodons",
                remoteDonationId: donation.id.toString(),
                notes: donation.comment || "",
                for_campaign: donation.category ? true : false,
                infos: {
                    category: donation.category || "",
                    type: donation.type || "",
                    recurring: donation.recurring || false,
                    installment: donation.instalment || "-"
                }
            });
            
            await newDonation.save();
            newDonationsCount++;
            console.log(`💰 Created new donation: ${newDonation._id} (Allodon ID: ${donation.id})`);
        }
        
        console.log(`✅ Allodon sync completed: ${newDonorsCount} new donors, ${newDonationsCount} new donations`);
        return { newDonors: newDonorsCount, newDonations: newDonationsCount };
    } catch (error) {
        console.error(`❌ Error processing Allodon donations:`, error);
        throw error;
    }
};

// MAIN SYNC FUNCTION
const performDailySync = async () => {
    console.log(`\n========================================`);
    console.log(`🔄 Starting daily sync: ${new Date().toISOString()}`);
    console.log(`========================================\n`);
    
    const results = {
        nedarim: { success: false, newDonors: 0, newDonations: 0, error: null },
        allodon: { success: false, newDonors: 0, newDonations: 0, error: null }
    };
    
    try {
        // 1. Process Nedarim donations
        console.log(`\n🔄 STEP 1: Processing Nedarim donations from the last 24 hours...`);
        try {
            const nedarimResults = await processNedarimDonations();
            results.nedarim = { 
                success: true, 
                ...nedarimResults,
                error: null
            };
        } catch (error) {
            console.error(`❌ Error in Nedarim sync:`, error);
            results.nedarim.error = error.message;
        }
        
        // 2. Process Allodon donations
        console.log(`\n🔄 STEP 2: Processing Allodon donations from the last 24 hours...`);
        try {
            const allodonResults = await processAllodonDonations();
            results.allodon = { 
                success: true, 
                ...allodonResults,
                error: null
            };
        } catch (error) {
            console.error(`❌ Error in Allodon sync:`, error);
            results.allodon.error = error.message;
        }
        
        console.log(`\n========================================`);
        console.log(`✅ Daily sync completed: ${new Date().toISOString()}`);
        console.log(`Nedarim: ${results.nedarim.newDonations} new donations, ${results.nedarim.newDonors} new donors`);
        console.log(`Allodon: ${results.allodon.newDonations} new donations, ${results.allodon.newDonors} new donors`);
        console.log(`========================================\n`);
        
        return {
            success: results.nedarim.success || results.allodon.success,
            results
        };
    } catch (error) {
        console.error(`❌ Error during daily sync:`, error);
        return {
            success: false,
            error: error.message,
            results
        };
    }
};

// Initialize the cron job
const initializeDailySyncCron = () => {
    // Run sync on startup
    console.log('🚀 Performing initial daily sync on server startup...');
    performDailySync().then(result => {
        console.log(`Initial daily sync ${result.success ? 'completed' : 'failed'}`);
    }).catch(error => {
        console.error('Error during initial daily sync:', error);
    });
    
    // Schedule daily sync at midnight
    cron.schedule("0 0 * * *", () => {
        console.log("Running scheduled daily sync...");
        performDailySync();
    });
    
    console.log('✅ Daily sync cron job initialized (runs daily at midnight)');
};

// Export functions
module.exports = {
    initializeDailySyncCron,
    performDailySync
}; 