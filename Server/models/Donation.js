const mongoose = require('mongoose');

// define schema for donations
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
    type: {
        type: String,
        required: true,
    },
    method: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    notes: {
        type: String,
        required: false,
    },
}, { timestamps: true });

module.exports = mongoose.model('Donation', donationSchema);