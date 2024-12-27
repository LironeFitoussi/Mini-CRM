// models/Lead.js
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

// Lead Schema
const leadSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100, // Maximum title length
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500, // Maximum description length
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // The user or admin who owns the lead list
      required: true,
    },
    donators: [
      {
        donatorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Donator',
          required: true,
        },
        status: {
          type: String,
          enum: [
            'To Contact',         // Translated from A contacter
            'No Response',        // Translated from Nrp
            'To Call Back',       // Translated from A rappeler
            'Meeting Scheduled',  // Translated from Rdv
            'Not Interested',     // Translated from Pas intéressé
            'Nothing to Report'   // Translated from RAS
          ],
          default: 'To Contact',
        }
      },
    ],
    metadata: {
      type: Map,
      of: String, // Flexible key-value pairs for additional data
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
    versionKey: false, // Disable the __v field
  }
);

// Index for faster querying by owner or donator status
leadSchema.index({ owner: 1, 'donators.status': 1 });

// pre fetch each donator from Donator collection
leadSchema.pre('find', function() {
  this.populate('donators.donatorId');
});

// Lead Model
const Lead = model('Lead', leadSchema);

module.exports = Lead;
