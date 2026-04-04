const express = require("express");
const mongoose = require("mongoose");

const { protect } = require("../middleware/authMiddleware");
const { doctorOnly } = require("../middleware/doctorOnly");
const User = require("../models/user");
const Appointment = require("../models/appointmentModel");
const {
  todayYmd,
  initialsFromName,
  normalizeTimeDisplay,
  formatVisitDateLabel,
} = require("../utils/appointments");

const router = express.Router();

function doctorId(req) {
  return new mongoose.Types.ObjectId(String(req.user.id));
}

router.get("/admin/requests", protect, doctorOnly, async (req, res) => {
  try {
    const list = await Appointment.find({ doctor: doctorId(req), status: "pending" })
      .populate("user", "name avatar")
      .sort({ date: 1, time: 1, createdAt: 1 })
      .lean();

    const requests = list.map((row) => {
      const patient = row.user || {};
      const name = patient.name || "Patient";
      const detail = `${row.service || "Consultation"} · ${row.date} · ${row.time}`;
      return {
        id: String(row._id),
        initials: initialsFromName(name),
        name,
        detail,
        status: "pending",
      };
    });

    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error loading requests" });
  }
});

router.get("/admin/today", protect, doctorOnly, async (req, res) => {
  try {
    const day = todayYmd();
    const list = await Appointment.find({
      doctor: doctorId(req),
      date: day,
      status: { $in: ["pending", "confirmed"] },
    })
      .populate("user", "name avatar")
      .sort({ time: 1, createdAt: 1 })
      .lean();

    const appointments = list.map((row) => {
      const patient = row.user || {};
      const name = patient.name || "Patient";
      const typeLabel = row.service || "Clinic Consulting";
      const right =
        row.status === "pending"
          ? { kind: "status", label: "Pending" }
          : { kind: "time", value: normalizeTimeDisplay(row.time) };

      return {
        id: String(row._id),
        initials: initialsFromName(name),
        name,
        type: typeLabel,
        right,
      };
    });

    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error loading today" });
  }
});

router.get("/admin/payments", protect, doctorOnly, async (req, res) => {
  res.json({ success: true, payments: [], total: 0 });
});

router.get("/admin/stats", protect, doctorOnly, async (req, res) => {
  try {
    const docObjectId = doctorId(req);
    const day = todayYmd();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [pendingCount, cancelledCount, todayCount, totalAppointments, userIds] =
      await Promise.all([
        Appointment.countDocuments({ doctor: docObjectId, status: "pending" }),
        Appointment.countDocuments({ doctor: docObjectId, status: "cancelled" }),
        Appointment.countDocuments({
          doctor: docObjectId,
          date: day,
          status: { $in: ["pending", "confirmed"] },
        }),
        Appointment.countDocuments({ doctor: docObjectId }),
        Appointment.distinct("user", { doctor: docObjectId }),
      ]);

    const uniquePatients = userIds.length;

    const firstVisits = await Appointment.aggregate([
      { $match: { doctor: docObjectId } },
      { $group: { _id: "$user", firstAt: { $min: "$createdAt" } } },
      { $match: { firstAt: { $gte: thirtyDaysAgo } } },
      { $count: "c" },
    ]);
    const newPatients = firstVisits[0]?.c || 0;
    const returningPatients = Math.max(0, uniquePatients - newPatients);

    let male = 0;
    let female = 0;
    let other = 0;

    if (userIds.length) {
      const users = await User.find({ _id: { $in: userIds } }).select("gender").lean();
      for (const u of users) {
        const g = String(u.gender || "")
          .trim()
          .toLowerCase();
        if (g === "male" || g === "m") male += 1;
        else if (g === "female" || g === "f") female += 1;
        else other += 1;
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
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error loading stats" });
  }
});

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Out-Patient",
  cancelled: "Cancelled",
};

router.get("/admin/recent-patients", protect, doctorOnly, async (req, res) => {
  try {
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || "10"), 10) || 10));
    const list = await Appointment.find({ doctor: doctorId(req) })
      .populate("user", "name gender avatar")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const patients = list.map((row) => {
      const p = row.user || {};
      const name = p.name || "Patient";
      const tail = String(row._id).slice(-4).toUpperCase();

      return {
        id: String(row._id),
        patientName: name,
        initials: initialsFromName(name),
        visitId: `OPD-${tail}`,
        date: row.date,
        dateDisplay: formatVisitDateLabel(row.date),
        gender: p.gender && String(p.gender).trim() ? p.gender : "—",
        diseases: row.service || "—",
        statusLabel: STATUS_LABELS[row.status] || row.status,
      };
    });

    res.json({ success: true, patients });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error loading patients" });
  }
});

router.patch("/:id/status", protect, doctorOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid appointment id" });
    }

    const { status } = req.body || {};
    let next = status;
    if (status === "declined") next = "cancelled";
    else if (status === "confirmed") next = "confirmed";

    if (next !== "confirmed" && next !== "cancelled") {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appt = await Appointment.findOne({
      _id: req.params.id,
      doctor: doctorId(req),
    });

    if (!appt) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appt.status = next;
    await appt.save();
    res.json({ success: true, appointment: appt });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error updating status" });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      user: new mongoose.Types.ObjectId(String(req.user.id)),
    })
      .populate("doctor", "name specialty avatar")
      .sort({ date: 1, createdAt: 1 })
      .lean();

    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ message: "Error fetching appointments" });
  }
});

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
  } catch (err) {
    res.status(400).json({ message: err.message || "Error creating appointment" });
  }
});

router.get("/:id", protect, async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (appointment) {
    res.json(appointment);
  } else {
    res.status(404).json({ message: "Appointment not found" });
  }
});

router.put("/:id", protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    appointment.status = req.body.status || appointment.status;
    const updated = await appointment.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Error updating appointment" });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    await appointment.deleteOne();
    res.json({ message: "Appointment removed" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting appointment" });
  }
});

module.exports = router;
