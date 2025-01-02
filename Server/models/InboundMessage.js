// models/InboundMessage.js

const mongoose = require('mongoose');

const InboundMessageSchema = new mongoose.Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    body: { type: String, required: true },
    messageSid: { type: String, required: true, unique: true },
    // Optionally store more metadata from Twilio
    dateCreated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('InboundMessage', InboundMessageSchema);
