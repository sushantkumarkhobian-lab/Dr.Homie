const express = require("express");
const IoTData = require("../models/IoTData");

const router = express.Router();

/* =========================
   FETCH IOT DATA
========================= */
router.get("/data", async (req, res) => {
  const data = await IoTData.find().sort({ timestamp: -1 });
  res.json(data);
});

module.exports = router;
