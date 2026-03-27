const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String,
      required: [true, "Please provide an appointment date"],
    },
    time: {
      type: String,
      required: [true, "Please provide an appointment time"],
    },
    service: {
      type: String,
      required: [true, "Please specify the service"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Updated export line to prevent OverwriteModelError
module.exports = mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);