const mongoose = require("mongoose");

const iotSchema = new mongoose.Schema(
  {
    temperature: Number,
    pulse: Number,
    glucose: Number,
    timestamp: { type: Date, default: Date.now }
  },
  {
    collection: "IoT" // 👈 force exact collection name
  }
);

module.exports = mongoose.model("IoTData", iotSchema);
