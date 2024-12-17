const mongoose = require("mongoose");

// Define a sub-schema for phone numbers
const phoneSchema = new mongoose.Schema({
  number: {
    type: String,
    // required: true,
  },
  country: {
    type: String,
    // required: true,
  },
  is_whatsapp: {
    type: String, // Consistent with your data assignment
    enum: ["true", "false", "unknown"], // Consistent string values
    required: false,
    default: "unknown",
  },
});

// Main donator schema
const donatorSchema = new mongoose.Schema(
  {
    fName: {
      type: String,
      // required: true,
    },
    lName: {
      type: String,
      // required: true,
    },
    allo_dons_id: {
      type: String,
      // required: false,
    },
    email_1: {
      type: String,
      // required: false,
    },
    email_2: {
      type: String,
      // required: false,
    },
    email_3: {
      type: String,
      // required: false,
    },
    phone_number_1: phoneSchema, // Directly assign the sub-schema
    phone_number_2: phoneSchema,
    phone_number_3: phoneSchema,
  },
  { timestamps: true }
);

donatorSchema.set("toObject", { virtuals: true });
donatorSchema.set("toJSON", { virtuals: true });

// Virtual field for donations
donatorSchema.virtual("donations", {
  ref: "Donation", // The model to use
  localField: "_id", // The field in Donator
  foreignField: "donator_id", // The field in Donation that points to Donator
});


const Donator = mongoose.model("Donator", donatorSchema);

module.exports = Donator;
