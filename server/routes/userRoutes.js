const express = require("express")
const { protect } = require("../middleware/authMiddleware")
const User = require("../models/user")

const router = express.Router()

// @desc  List doctors (for patient booking UI)
// @route GET /api/users/doctors
router.get("/doctors", protect, async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" })
      .select("name specialty city state country address availabilityDays availabilityHours avatar")
      .sort({ name: 1 })
      .lean();

    const list = doctors.map((d) => {
      const rawName = String(d.name || "").trim();
      const displayName = /^dr\.?\s/i.test(rawName) ? rawName : `Dr. ${rawName || "Doctor"}`;
      const locationParts = [d.city, d.state, d.country].filter(Boolean);
      const cityLine = locationParts.length ? locationParts.join(", ") : d.address || "Location not set";

      return {
        id: String(d._id),
        name: displayName,
        tag: d.specialty || "Doctor",
        city: cityLine,
        days: d.availabilityDays || "Mon – Fri",
        time: d.availabilityHours || "9:00 – 17:00",
        avatar: typeof d.avatar === "string" ? d.avatar : "",
      };
    });

    res.json({ success: true, doctors: list });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error fetching doctors" });
  }
});

// @desc  Get logged-in user profile
// @route GET /api/users/profile
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    res.json({ success: true, user })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

// @desc  Update logged-in user profile
// @route PUT /api/users/profile
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
    } = req.body

    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: "User not found" })

    // Check duplicate email (exclude current user)
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } })
      if (emailExists) return res.status(400).json({ message: "This email is already used by another account" })
    }

    // Check duplicate phone (exclude current user)
    if (phone && phone !== user.phone) {
      const phoneExists = await User.findOne({ phone, _id: { $ne: user._id } })
      if (phoneExists) return res.status(400).json({ message: "This phone number is already used by another account" })
    }

    // Update fields
    if (name) user.name = name
    if (email) user.email = email.toLowerCase()
    if (phone) user.phone = phone
    if (city !== undefined) user.city = city
    if (address !== undefined) user.address = address
    if (state !== undefined) user.state = state
    if (country !== undefined) user.country = country
    if (user.role === "doctor") {
      if (specialty !== undefined) user.specialty = specialty
      if (availabilityDays !== undefined) user.availabilityDays = availabilityDays
      if (availabilityHours !== undefined) user.availabilityHours = availabilityHours
    }

    if (avatar !== undefined) {
      if (avatar === null || avatar === "") user.avatar = ""
      else if (typeof avatar === "string") user.avatar = avatar
    }
    if (gender !== undefined) user.gender = gender
    if (birthDate !== undefined) {
      if (!birthDate) user.birthDate = undefined
      else {
        const d = new Date(birthDate)
        if (!Number.isNaN(d.getTime())) user.birthDate = d
      }
    }

    // Plain text; User model pre('save') hashes it (avoid double-hash)
    if (password && password.length >= 8) {
      user.password = password
    }

    await user.save()
    const fresh = await User.findById(req.user.id).select("-password")
    const userResponse = fresh.toJSON()

    res.json({ success: true, message: "Profile updated successfully", user: userResponse })
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0]
      return res.status(400).json({ message: `This ${field} is already registered` })
    }
    res.status(500).json({ message: error.message || "Server error" })
  }
})
router.delete("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    res.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

module.exports = router