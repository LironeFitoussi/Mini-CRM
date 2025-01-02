// routes/twilioInbound.js

const express = require('express');
const router = express.Router();
const InboundMessage = require('../models/InboundMessage');

// Twilio sends incoming SMS data in the POST body with specific parameter names:
// - From, To, Body, SmsSid or MessageSid, etc.

router.post('/inbound', async (req, res) => {
  try {
    // Twilio typically sends these fields in URL-encoded format, so ensure your app handles urlencoded bodies.
    const { From, To, Body, MessageSid, SmsSid } = req.body;

    // If Twilio uses `MessageSid` or `SmsSid`, prefer `MessageSid` if available
    const messageSid = MessageSid || SmsSid;

    // Basic validation
    if (!From || !To || !Body || !messageSid) {
      return res.status(400).send('Missing required fields from Twilio request.');
    }

    // Create a new inbound message document
    const inboundMessage = new InboundMessage({
      from: From,
      to: To,
      body: Body,
      messageSid: messageSid
    });

    // Save to MongoDB
    await inboundMessage.save();

    // Optionally respond with TwiML if you want to send an auto-reply
    // If you don’t want to auto-reply, you can respond with empty TwiML or just 200 OK
    // Example TwiML response:
    const twimlResponse = `
      <?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Message>
            Ceci est une réponse automatique. Si vous souhaitez nous contacter, veuillez nous appeler au +972509688456
        </Message>
      </Response>
    `;

    // Set content type for TwiML and send
    res.set('Content-Type', 'text/xml');
    res.status(200).send(twimlResponse);

  } catch (err) {
    console.error('Error handling inbound SMS:', err);
    res.status(500).send('Failed to handle inbound SMS.');
  }
});

module.exports = router;
