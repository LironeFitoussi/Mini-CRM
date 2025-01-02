// services/twilioService.js

require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Create a Twilio client
const client = twilio(accountSid, authToken);

/**
 * Sends an SMS using Twilio
 *
 * @param {string} to - The recipient phone number (E.164 format, e.g. +18005551234)
 * @param {string} message - The body text of the SMS
 * @returns {Promise} - Resolves with Twilio response object on success
 */
async function sendSms(to, message) {
  try {
    const response = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to, 
    });
    // You can return the entire response or just the SID
    return response;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
}

module.exports = {
  sendSms,
};
