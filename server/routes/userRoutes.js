const express = require("express")
const { protect } = require("../middleware/authMiddleware")
const User = require("../models/user")
const bcrypt = require("bcryptjs")

const router = express.Router()

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
    const { name, email, phone, password } = req.body

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
    if (name)  user.name  = name
    if (email) user.email = email.toLowerCase()
    if (phone) user.phone = phone

    // Update password if provided
    if (password && password.length >= 8) {
      user.password = bcrypt.hashSync(password, 10)
    }

    const updated = await user.save()

    const userResponse = {
      id: updated._id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      role: updated.role,
    }

    res.json({ success: true, message: "Profile updated successfully", user: userResponse })
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0]
      return res.status(400).json({ message: `This ${field} is already registered` })
    }
    res.status(500).json({ message: error.message || "Server error" })
  }
})

module.exports = router