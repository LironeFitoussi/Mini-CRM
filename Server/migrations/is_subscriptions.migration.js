const mongoose = require("mongoose");
const Donator = require("../models/Donator.js"); // Adjust the path if needed
const dotenv = require("dotenv");
dotenv.config();
// Connect to your MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function migrateData() {
    try {
      console.log("Starting migration...");
  
      const donators = await Donator.find();
  
      // Map through the donators and create an array of promises
      const updatePromises = donators.map(async (donator) => {
        // Update phone numbers with default values
        const phoneFields = ["phone_number_1", "phone_number_2", "phone_number_3"];
        phoneFields.forEach((field) => {
          if (donator[field]) {
            if (donator[field].isSubscribed === undefined) {
              donator[field].isSubscribed = true; // Set default value
            }
          } else {
            donator[field] = { isSubscribed: true }; // Set a default sub-document
          }
        });
  
        // Update emails with default values
        const emailFields = ["email_1", "email_2", "email_3"];
        emailFields.forEach((field) => {
          if (donator[field]) {
            if (donator[field].isSubscribed === undefined) {
              donator[field].isSubscribed = true; // Set default value
            }
          } else {
            donator[field] = { isSubscribed: true }; // Set a default sub-document
          }
        });
  
        // Return the save promise
        return donator.save();
      });
  
      // Wait for all updates to complete
      await Promise.all(updatePromises);
  
      console.log("Migration completed successfully!");
    } catch (error) {
      console.error("Error during migration:", error);
    } finally {
      mongoose.disconnect();
    }
  }
  
  migrateData();