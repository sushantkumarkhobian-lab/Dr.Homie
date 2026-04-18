const express = require("express");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const nodemailer = require("nodemailer");

const router = express.Router();

/* =========================
   BOOK APPOINTMENT
========================= */
router.post("/book", async (req, res) => {
  try {
    const { doctorId, userEmail, time } = req.body;

    const alreadyBooked = await Appointment.findOne({ doctorId, time });
    if (alreadyBooked)
      return res.status(400).json({ message: "Slot already booked" });

    const appointment = new Appointment({ doctorId, userEmail, time });
    await appointment.save();

    const doctor = await Doctor.findById(doctorId);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    await transporter.sendMail({
      to: doctor.email,
      subject: "New Appointment",
      text: `You have a new appointment at ${time}`
    });

    res.json({ message: "Appointment booked successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
