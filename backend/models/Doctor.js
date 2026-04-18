const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    specialty: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true }
  },
  {
    timestamps: true,
    collection: "Doctor"   // 👈 THIS IS THE FIX
  }
);

module.exports = mongoose.model("Doctor", doctorSchema);

