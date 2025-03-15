require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');

// Import Donation model
const Donation = require('../models/Donation');

const updateCurrencySymbol = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to database. Starting update...');

    // Find donations with currency 'nis' or '1'
    const result = await Donation.updateMany(
      { currency: { $in: ['NIS', '1'] } },
      { $set: { currency: '₪' } }
    );

    console.log(`Update completed successfully!`);
    console.log(`${result.matchedCount} donations matched the criteria`);
    console.log(`${result.modifiedCount} donations were updated`);

    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error occurred during update:', error);
    // Close the database connection
    if (mongoose.connection) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

// Run the function
updateCurrencySymbol(); 