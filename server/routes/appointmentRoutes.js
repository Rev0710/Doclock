const express = require("express")
const mongoose = require("mongoose")
const { protect } = require("../middleware/authMiddleware")
const { doctorOnly } = require("../middleware/doctorOnly")
const User = require("../models/user")
const Appointment = require("../models/appointmentModel") // <-- MAKE SURE THIS PATH IS CORRECT

const router = express.Router()

function todayYmd() {
  const t = new Date()
  const y = t.getFullYear()
  const m = String(t.getMonth() + 1).padStart(2, "0")
  const d = String(t.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function initialsFromName(name) {
  const s = String(name || "P")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
  return s || "P"
}

function normalizeTimeDisplay(time) {
  const s = String(time || "").trim()
  return s || "—"
}

// @desc  Pending booking requests for logged-in doctor
// @route GET /api/appointments/admin/requests
router.get("/admin/requests", protect, doctorOnly, async (req, res) => {
  try {
    const docId = new mongoose.Types.ObjectId(String(req.user.id))
    const list = await Appointment.find({ doctor: docId, status: "pending" })
      .populate("user", "name avatar")
      .sort({ date: 1, time: 1, createdAt: 1 })
      .lean()

    const requests = list.map((a) => {
      const patient = a.user || {}
      const name = patient.name || "Patient"
      const detail = `${a.service || "Consultation"} · ${a.date} · ${a.time}`
      return {
        id: String(a._id),
        initials: initialsFromName(name),
        name,
        detail,
        status: "pending",
      }
    })

    res.json({ success: true, requests })
  } catch (e) {
    res.status(500).json({ message: e.message || "Error loading requests" })
  }
})

// @desc  Today's schedule for logged-in doctor
// @route GET /api/appointments/admin/today
router.get("/admin/today", protect, doctorOnly, async (req, res) => {
  try {
    const docId = new mongoose.Types.ObjectId(String(req.user.id))
    const day = todayYmd()
    const list = await Appointment.find({
      doctor: docId,
      date: day,
      status: { $in: ["pending", "confirmed"] },
    })
      .populate("user", "name avatar")
      .sort({ time: 1, createdAt: 1 })
      .lean()

    const appointments = list.map((a) => {
      const patient = a.user || {}
      const name = patient.name || "Patient"
      const typeLabel = a.service || "Clinic Consulting"
      const right =
        a.status === "pending"
          ? { kind: "status", label: "Pending" }
          : { kind: "time", value: normalizeTimeDisplay(a.time) }
      return {
        id: String(a._id),
        initials: initialsFromName(name),
        name,
        type: typeLabel,
        right,
      }
    })

    res.json({ success: true, appointments })
  } catch (e) {
    res.status(500).json({ message: e.message || "Error loading today" })
  }
})

// @desc  Payments placeholder (no payment model yet)
// @route GET /api/appointments/admin/payments
router.get("/admin/payments", protect, doctorOnly, async (req, res) => {
  res.json({ success: true, payments: [], total: 0 })
})

// @desc  Dashboard stats for logged-in doctor
// @route GET /api/appointments/admin/stats
router.get("/admin/stats", protect, doctorOnly, async (req, res) => {
  try {
    const docId = new mongoose.Types.ObjectId(String(req.user.id))
    const day = todayYmd()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [pendingCount, cancelledCount, todayCount, totalAppointments, userIds] = await Promise.all([
      Appointment.countDocuments({ doctor: docId, status: "pending" }),
      Appointment.countDocuments({ doctor: docId, status: "cancelled" }),
      Appointment.countDocuments({
        doctor: docId,
        date: day,
        status: { $in: ["pending", "confirmed"] },
      }),
      Appointment.countDocuments({ doctor: docId }),
      Appointment.distinct("user", { doctor: docId }),
    ])

    const uniquePatients = userIds.length

    const firstVisits = await Appointment.aggregate([
      { $match: { doctor: docId } },
      { $group: { _id: "$user", firstAt: { $min: "$createdAt" } } },
      { $match: { firstAt: { $gte: thirtyDaysAgo } } },
      { $count: "c" },
    ])
    const newPatients = firstVisits[0]?.c || 0
    const returningPatients = Math.max(0, uniquePatients - newPatients)

    let male = 0
    let female = 0
    let other = 0
    if (userIds.length) {
      const users = await User.find({ _id: { $in: userIds } }).select("gender").lean()
      for (const u of users) {
        const g = String(u.gender || "")
          .trim()
          .toLowerCase()
        if (g === "male" || g === "m") male += 1
        else if (g === "female" || g === "f") female += 1
        else other += 1
      }
    }

    res.json({
      success: true,
      stats: {
        totalAppointments,
        uniquePatients,
        pendingCount,
        cancelledCount,
        todayCount,
        newPatients,
        returningPatients,
        gender: { male, female, other },
      },
    })
  } catch (e) {
    res.status(500).json({ message: e.message || "Error loading stats" })
  }
})

// @desc  Recent visits for this doctor (for admin table)
// @route GET /api/appointments/admin/recent-patients
router.get("/admin/recent-patients", protect, doctorOnly, async (req, res) => {
  try {
    const docId = new mongoose.Types.ObjectId(String(req.user.id))
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || "10"), 10) || 10))
    const list = await Appointment.find({ doctor: docId })
      .populate("user", "name gender avatar")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    const statusLabels = {
      pending: "Pending",
      confirmed: "Out-Patient",
      cancelled: "Cancelled",
    }

    const patients = list.map((a) => {
      const p = a.user || {}
      const name = p.name || "Patient"
      const tail = String(a._id).slice(-4).toUpperCase()
      let dateDisplay = a.date
      if (/^\d{4}-\d{2}-\d{2}$/.test(String(a.date))) {
        const [yy, mm, dd] = String(a.date).split("-").map(Number)
        const dt = new Date(yy, mm - 1, dd)
        if (!Number.isNaN(dt.getTime())) dateDisplay = dt.toLocaleDateString()
      }
      return {
        id: String(a._id),
        patientName: name,
        initials: initialsFromName(name),
        visitId: `OPD-${tail}`,
        date: a.date,
        dateDisplay,
        gender: p.gender && String(p.gender).trim() ? p.gender : "—",
        diseases: a.service || "—",
        statusLabel: statusLabels[a.status] || a.status,
      }
    })

    res.json({ success: true, patients })
  } catch (e) {
    res.status(500).json({ message: e.message || "Error loading patients" })
  }
})

// @desc  Doctor confirms or declines a pending appointment
// @route PATCH /api/appointments/:id/status
router.patch("/:id/status", protect, doctorOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid appointment id" })
    }
    const { status } = req.body || {}
    let next = status
    if (status === "declined") next = "cancelled"
    else if (status === "confirmed") next = "confirmed"
    if (next !== "confirmed" && next !== "cancelled") {
      return res.status(400).json({ message: "Invalid status" })
    }
    const docId = new mongoose.Types.ObjectId(String(req.user.id))
    const appt = await Appointment.findOne({
      _id: req.params.id,
      doctor: docId,
    })
    if (!appt) {
      return res.status(404).json({ message: "Appointment not found" })
    }
    appt.status = next
    await appt.save()
    res.json({ success: true, appointment: appt })
  } catch (e) {
    res.status(500).json({ message: e.message || "Error updating status" })
  }
})

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