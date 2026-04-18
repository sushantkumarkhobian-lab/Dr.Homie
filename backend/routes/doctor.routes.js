const express = require("express");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Doctor = require("../models/Doctor");

const router = express.Router();

/* =========================
   REGISTER DOCTOR (EMAIL)
========================= */
router.post("/register", async (req, res) => {
  try {
    const { name, specialty, phone, email } = req.body;

    const token = jwt.sign(
      { name, specialty, phone, email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const verifyLink = `https://ectodermal-wirily-mekhi.ngrok-free.dev/api/doctor/verify/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    await transporter.sendMail({
      to: email,
      subject: "Doctor Registration Verification",
      html: `
        <h3>Verify Your Registration</h3>
        <a href="${verifyLink}">Click to Verify</a>
      `
    });

    res.json({ message: "Verification email sent" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   VERIFY DOCTOR (SAVE DB)
========================= */
router.get("/verify/:token", async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);

    const exists = await Doctor.findOne({ email: decoded.email });
    if (exists) return res.send("Doctor already registered");

    const doctor = new Doctor(decoded);
    await doctor.save();

    res.send("Doctor registered successfully");

  } catch (err) {
    console.error("JWT ERROR:", err.message);
    res.status(400).send("Invalid or expired token");
  }
});

/* =========================
   FETCH ALL DOCTORS
========================= */
router.get("/all", async (req, res) => {
  const doctors = await Doctor.find();
  res.json(doctors);
});

module.exports = router;
