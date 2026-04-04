const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const User = require("../models/user");
const { mergeHealthProfile, applyHealthRecordBody } = require("../utils/healthProfile");

const router = express.Router();

router.get("/doctors", protect, async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" })
      .select("name specialty city state country address availabilityDays availabilityHours avatar")
      .sort({ name: 1 })
      .lean();

    const list = doctors.map((doc) => {
      const rawName = String(doc.name || "").trim();
      const displayName = /^dr\.?\s/i.test(rawName) ? rawName : `Dr. ${rawName || "Doctor"}`;
      const locationParts = [doc.city, doc.state, doc.country].filter(Boolean);
      const cityLine = locationParts.length
        ? locationParts.join(", ")
        : doc.address || "Location not set";

      return {
        id: String(doc._id),
        name: displayName,
        tag: doc.specialty || "Doctor",
        city: cityLine,
        days: doc.availabilityDays || "Mon – Fri",
        time: doc.availabilityHours || "9:00 – 17:00",
        avatar: typeof doc.avatar === "string" ? doc.avatar : "",
      };
    });

    res.json({ success: true, doctors: list });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error fetching doctors" });
  }
});

router.get("/health-record", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("healthProfile").lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ success: true, healthProfile: mergeHealthProfile(user.healthProfile) });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error loading health record" });
  }
});

router.put("/health-record", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = applyHealthRecordBody(user, req.body);
    if (!result.ok) {
      return res.status(result.status).json({ message: result.message });
    }

    await user.save();
    const fresh = await User.findById(req.user.id).select("healthProfile").lean();
    res.json({ success: true, healthProfile: mergeHealthProfile(fresh.healthProfile) });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error saving health record" });
  }
});

router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/profile", protect, async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      city,
      address,
      state,
      country,
      specialty,
      availabilityDays,
      availabilityHours,
      avatar,
      gender,
      birthDate,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email && email !== user.email) {
      const taken = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });
      if (taken) {
        return res.status(400).json({ message: "This email is already used by another account" });
      }
    }

    if (phone && phone !== user.phone) {
      const taken = await User.findOne({ phone, _id: { $ne: user._id } });
      if (taken) {
        return res.status(400).json({ message: "This phone number is already used by another account" });
      }
    }

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (phone) user.phone = phone;
    if (city !== undefined) user.city = city;
    if (address !== undefined) user.address = address;
    if (state !== undefined) user.state = state;
    if (country !== undefined) user.country = country;

    if (user.role === "doctor") {
      if (specialty !== undefined) user.specialty = specialty;
      if (availabilityDays !== undefined) user.availabilityDays = availabilityDays;
      if (availabilityHours !== undefined) user.availabilityHours = availabilityHours;
    }

    if (avatar !== undefined) {
      if (avatar === null || avatar === "") {
        user.avatar = "";
      } else if (typeof avatar === "string") {
        user.avatar = avatar;
      }
    }

    if (gender !== undefined) user.gender = gender;

    if (birthDate !== undefined) {
      if (!birthDate) {
        user.birthDate = undefined;
      } else {
        const d = new Date(birthDate);
        if (!Number.isNaN(d.getTime())) {
          user.birthDate = d;
        }
      }
    }

    if (password && password.length >= 8) {
      user.password = password;
    }

    await user.save();
    const updated = await User.findById(req.user.id).select("-password");
    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updated.toJSON(),
    });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({ message: `This ${field} is already registered` });
    }
    res.status(500).json({ message: err.message || "Server error" });
  }
});

router.delete("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await user.deleteOne();
    res.json({ success: true, message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

module.exports = router;
