const mongoose = require('mongoose');
const Donor = require('../models/Donor');
const dotenv = require('dotenv');
const path = require('path');
const Notification = require('../models/Notification');

// get from .env file at the root of the project
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Function to clean and standardize phone number
function standardizePhoneNumber(number) {
    if (!number) return null;
    
    // Remove all non-digit characters
    let cleaned = number.replace(/[^0-9]/g, '');
    
    // Handle numbers starting with 00
    if (cleaned.startsWith('00')) {
        cleaned = cleaned.substring(2);
        if (cleaned.startsWith('33')) {
            return '+' + cleaned;
        } else if (cleaned.startsWith('972')) {
            return '+' + cleaned;
        }
    }
    
    // Handle Israeli numbers (05)
    if (cleaned.startsWith('05')) {
        return '+972' + cleaned.substring(1);
    }
    
    // Handle French numbers (06, 07)
    if (cleaned.startsWith('06') || cleaned.startsWith('07')) {
        return '+33' + cleaned.substring(1);
    }
    
    // If number already starts with +, just ensure it's clean
    if (number.startsWith('+')) {
        return '+' + cleaned;
    }
    
    return cleaned;
}

async function updatePhoneNumbers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('Connected to MongoDB');
        
        // Get all donors
        const donors = await Donor.find({});
        console.log(`Found ${donors.length} donors to process`);
        
        let updatedCount = 0;
        
        // Process each donor
        for (const donor of donors) {
            let needsUpdate = false;
            
            // Process phone_number_1
            if (donor.phone_number_1 && donor.phone_number_1.number) {
                const newNumber = standardizePhoneNumber(donor.phone_number_1.number);
                if (newNumber !== donor.phone_number_1.number) {
                    donor.phone_number_1.number = newNumber;
                    needsUpdate = true;
                }
            }
            
            // Process phone_number_2
            if (donor.phone_number_2 && donor.phone_number_2.number) {
                const newNumber = standardizePhoneNumber(donor.phone_number_2.number);
                if (newNumber !== donor.phone_number_2.number) {
                    donor.phone_number_2.number = newNumber;
                    needsUpdate = true;
                }
            }
            
            // Process phone_number_3
            if (donor.phone_number_3 && donor.phone_number_3.number) {
                const newNumber = standardizePhoneNumber(donor.phone_number_3.number);
                if (newNumber !== donor.phone_number_3.number) {
                    donor.phone_number_3.number = newNumber;
                    needsUpdate = true;
                }
            }
            
            // Save if any changes were made
            if (needsUpdate) {
                await donor.save();
                updatedCount++;
            }
        }
        
        console.log(`Successfully updated ${updatedCount} donors`);
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Close the MongoDB connection
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
}

// Run the script
updatePhoneNumbers(); 