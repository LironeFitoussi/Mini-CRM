const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    email: {
        type: String,
        // required: true
    },
    phoneNumber: {
        type: String,
        // required: true
    },
    country: {
        type: String,
        // required: true
    },
    is_whatsapp: {
        type: mongoose.Schema.Types.Mixed,
        enum: [true, false, 'unknown'],
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
          delete ret._id;
        },
      },
      toObject: { virtuals: true },
});

const Contact = mongoose.model('valid_numbers', contactSchema);

module.exports = Contact;