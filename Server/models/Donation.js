// models/Donation.js
const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donator_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donator',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  for_campaign: {
    type: Boolean,
    default: false,
  },
  euro_amount: {
    type: Number,
  },
  date: {
    type: Date,
    required: true,
  },
  method: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
  },
  transaction_id: {
    type: String,
  },
  cerfa: {
    type: String,
  },
  infos: {
    type: mongoose.Schema.Types.Mixed,
  },
  type: {
    type: String,
  },

  // Remote donation ID (to avoid duplicates)
  remoteDonationId: {
    type: Number,
    unique: true,
    sparse: true,
  },

  // ** New field to indicate which platform this donation came from **
  platform: {
    type: String,
    default: 'allodons',
  },
}, { timestamps: true });

module.exports = mongoose.model('Donation', donationSchema);