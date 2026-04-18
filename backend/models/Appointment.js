const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true
  },
  userEmail: { type: String, required: true },
  time: { type: Date, required: true },
  status: { type: String, default: "BOOKED" }
}, { timestamps: true, 
  collection: "Appointment"
});

module.exports = mongoose.model("Appointment", appointmentSchema);
