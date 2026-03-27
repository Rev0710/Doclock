const express = require("express")
const mongoose = require("mongoose")
const { protect } = require("../middleware/authMiddleware")
const Appointment = require("../models/appointmentModel") // <-- MAKE SURE THIS PATH IS CORRECT

const router = express.Router()

// @desc  Get all appointments for logged-in user
// @route GET /api/appointments
router.get("/", protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      user: new mongoose.Types.ObjectId(String(req.user.id)),
    })
      .sort({ date: 1, createdAt: 1 })
      .lean();
    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ message: "Error fetching appointments" })
  }
})

// @desc  Create a new appointment
// @route POST /api/appointments
router.post("/", protect, async (req, res) => {
  try {
    const { doctor, specialty, date, time, service: bodyService } = req.body;
    const service =
      bodyService ||
      [specialty, doctor].filter(Boolean).join(" — ") ||
      "Consultation";
    if (!date || !time) {
      return res.status(400).json({ message: "Date and time are required" });
    }
    const appointment = await Appointment.create({
      user: new mongoose.Types.ObjectId(String(req.user.id)),
      date: String(date),
      time: String(time),
      service: String(service),
      status: "pending",
    });
    res.status(201).json({ success: true, appointment });
  } catch (error) {
    res.status(400).json({ message: error.message || "Error creating appointment" });
  }
})

// @desc  Get single appointment
router.get("/:id", protect, async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (appointment) res.json(appointment);
  else res.status(404).json({ message: "Appointment not found" });
})

// @desc  Update appointment (Cancel or Change status)
router.put("/:id", protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (appointment) {
      appointment.status = req.body.status || appointment.status;
      const updatedAppt = await appointment.save();
      res.json(updatedAppt);
    } else {
      res.status(404).json({ message: "Appointment not found" });
    }
  } catch (error) {
    res.status(400).json({ message: "Error updating appointment" });
  }
})

// @desc  Delete appointment
router.delete("/:id", protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (appointment) {
      await appointment.deleteOne();
      res.json({ message: "Appointment removed" });
    } else {
      res.status(404).json({ message: "Appointment not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting appointment" });
  }
})

module.exports = router