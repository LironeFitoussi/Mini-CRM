const mongoose = require("mongoose");
const { Schema, model } = mongoose;

// LeadCard Schema
const leadCardSchema = new Schema(
  {
    leadList: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeadList",
      required: true,
    },
    donatorEntryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donator",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "To Contact", // Translated from A contacter
        "No Response", // Translated from Nrp
        "To Call Back", // Translated from A rappeler
        "Meeting Scheduled", // Translated from Rdv
        "Not Interested", // Translated from Pas intéressé
        "Nothing to Report", // Translated from RAS
      ],
      default: "To Contact",
    },
    nextContactDate: {
      type: Date,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
    versionKey: false, // Disable the __v field
  }
);

leadCardSchema.set("toJSON", { virtuals: true });
leadCardSchema.set("toObject", { virtuals: true });

// Virtual populate donator
leadCardSchema.virtual("donator", {
  ref: "Donator", // The model to use
  localField: "donatorEntryId", // Find donator where `localField`
  foreignField: "_id", // is equal to `foreignField`
});

leadCardSchema.pre(/^find/, function (next) {
  this.populate("donator");
  next();
});

// LeadCard Model
const LeadCard = model("LeadCard", leadCardSchema);

module.exports = LeadCard;
