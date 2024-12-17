// Assuming you have Mongoose set up
const mongoose = require('mongoose');
const Donator = require('../models/Donator');
const nodemailer = require('nodemailer');

async function fetchEmailsAndSend() {
  try {
    // 1. Fetch all documents from the model
    const users = await Donator.find({});
    
    // 2. Extract all email fields
    let allEmails = [];
    users.forEach(user => {
      // Convert the document to an object so we can iterate over fields
      const userObj = user.toObject();
      
      // For each field in the user object, check if it starts with 'email_'
      for (const key in userObj) {
        if (key.startsWith('email_') && userObj[key]) {
          // Assume that the field contains a valid email
          allEmails.push(userObj[key]);
        }
      }
    });

    // Remove duplicates if necessary
    allEmails = [...new Set(allEmails)];

    // 3. Send emails to the collected addresses
    // Set up nodemailer transport (configure as needed)
    const transporter = nodemailer.createTransport({
      host: 'smtp.your-email-provider.com',
      port: 587,
      secure: false,
      auth: {
        user: 'your-username',    // replace with your email user
        pass: 'your-password',    // replace with your email password
      }
    });

    // Prepare the email options
    const mailOptions = {
      from: '"Your Name" <your-email@example.com>', 
      to: allEmails.join(', '), // join all collected emails
      subject: 'Important Update',
      text: 'Hello, this is a bulk message to all users.'
    };

    // 4. Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Emails sent: ', info.messageId);
  } catch (error) {
    console.error('Error fetching/sending emails:', error);
  } finally {
    // If this was part of a script, you might close the DB connection:
    // mongoose.connection.close();
  }
}

// Run the function
fetchEmailsAndSend();
