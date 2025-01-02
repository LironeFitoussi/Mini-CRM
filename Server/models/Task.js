const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TaskSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "critical"],
    default: "pending",
  },
  dueDate: {
    type: Date,
    required: true,
  },
  donator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Donator",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Aggregate middleware to populate user and donator details
TaskSchema.pre("find", function (next) {
  this.populate("user", "fName email");
  this.populate("donator", "fName email");
  next();
});

module.exports = mongoose.model("Task", TaskSchema);
