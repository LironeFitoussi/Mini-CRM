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
  isSubscribed: {
    type: Boolean,
    default: true,
  },
});

const mailSchema = new mongoose.Schema({
  email: {
    type: String,
    // required: true,
  },
  isSubscribed: {
    type: Boolean,
    default: true,
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
    birthdate: {
      type: Date,
      // required: false,
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
        "Done", // Translated from Fait
        "To Validate", // Translated from A valider
      ],
      default: "To Contact",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    email_1: mailSchema, // Directly assign the sub-schema
    email_2: mailSchema, // Directly assign the sub-schema
    email_3: mailSchema, // Directly assign the sub-schema
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

// Virtual field for tasks
donatorSchema.virtual("tasks", {
  ref: "Task", // The model to use
  localField: "_id", // The field in Donator
  foreignField: "donator", // The field in Task that points to Donator
});

// Virtual field for notes
donatorSchema.virtual("notes", {
  ref: "Note", // The model to use
  localField: "_id", // The field in Donator
  foreignField: "donator", // The field in Note that points to Donator
});

// Virtual field for owner
donatorSchema.virtual("ownerDetails", {
  ref: "User", // The model to use
  localField: "owner", // The field in Donator
  foreignField: "_id", // The field in User that points to Donator
});

// Virtual to set the next contact date based on the latest note
donatorSchema.virtual("nextContactDate", {
  ref: "Note", // Reference the Note model
  localField: "_id", // Link with the Donator's _id
  foreignField: "donator", // Field in Note that points to Donator
  justOne: true, // Only retrieve one note
  options: {
    sort: { createdAt: -1 }, // Sort by createdAt in descending order
    match: { isCompleted: false, dueDate: { $exists: true } }, // Filter notes that are not completed and have a dueDate
  },
});

// Always populate the nextContactDate virtual field
donatorSchema.pre(/^find/, function (next) {
  this.populate({
    path: "nextContactDate",
    select: "dueDate createdAt", // Fetch dueDate and createdAt
  });
  next();
});

// Transform the schema to extract only the `dueDate` from the populated nextContactDate
donatorSchema.set("toObject", {
  virtuals: true,
  transform: (doc, ret) => {
    if (ret.nextContactDate && ret.nextContactDate.dueDate) {
      ret.nextContactDate = ret.nextContactDate.dueDate; // Replace the object with just the dueDate
    } else {
      ret.nextContactDate = null; // Ensure consistency when no note is found
    }
    return ret;
  },
});

donatorSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    if (ret.nextContactDate && ret.nextContactDate.dueDate) {
      ret.nextContactDate = ret.nextContactDate.dueDate; // Replace the object with just the dueDate
    } else {
      ret.nextContactDate = null; // Ensure consistency when no note is found
    }
    return ret;
  },
});


const Donator = mongoose.model("Donator", donatorSchema);

module.exports = Donator;
