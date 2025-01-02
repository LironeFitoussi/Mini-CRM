// routes/sms.js

const express = require('express');
const router = express.Router();
const { sendSms } = require('../services/twilioService');

/**
 * POST /sms/send
 * Example request body: { "to": "+18005551234", "message": "Hello from Twilio!" }
 */
router.post('/send', async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ error: 'Missing "to" or "message" in request body' });
  }

  try {
    const response = await sendSms(to, message);
    return res.status(200).json({
      success: true,
      sid: response.sid,
      message: 'SMS sent successfully',
      response,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to send SMS',
      details: error.message,
    });
  }
});

module.exports = router;
