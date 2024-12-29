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
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // The user or admin who owns the lead list
      required: true,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
    versionKey: false, // Disable the __v field
  }
);

leadSchema.set('toJSON', { virtuals: true });
leadSchema.set('toObject', { virtuals: true });

// Virtual populate LeadCard
leadSchema.virtual('leadCards', {
  ref: 'LeadCard', // The model to use
  localField: '_id', // Find lead where `localField`
  foreignField: 'leadList', // is equal to `foreignField`
});

const LeadList = model('LeadList', leadSchema);

module.exports = LeadList;
