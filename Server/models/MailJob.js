// models/MailJob.js

const mongoose = require('mongoose');

const MailJobSchema = new mongoose.Schema({
  recipients: {
    type: [String],
    required: true,
    validate: [arrayLimit, '{PATH} must have at least one recipient']
  },
  subject: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  sender: { // Reference to MailSender
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MailSender',
    required: true
  },
  is_sent: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Custom validator to ensure at least one recipient
function arrayLimit(val) {
  return val.length > 0;
}

module.exports = mongoose.model('MailJob', MailJobSchema);
