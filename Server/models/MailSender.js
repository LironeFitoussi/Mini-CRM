// models/MailSender.js

const mongoose = require('mongoose');

const MailSenderSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { // Gmail app password
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MailSender', MailSenderSchema);
