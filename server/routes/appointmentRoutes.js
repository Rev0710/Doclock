const express = require("express")
const { protect } = require("../middleware/authMiddleware")

const router = express.Router()

// @desc  Get all appointments for logged-in user
// @route GET /api/appointments
router.get("/", protect, (req, res) => {
  res.json({ message: "Get appointments - coming soon", user: req.user })
})

// @desc  Create a new appointment
// @route POST /api/appointments
router.post("/", protect, (req, res) => {
  res.json({ message: "Create appointment - coming soon" })
})

// @desc  Get single appointment
// @route GET /api/appointments/:id
router.get("/:id", protect, (req, res) => {
  res.json({ message: `Get appointment ${req.params.id} - coming soon` })
})

// @desc  Update appointment
// @route PUT /api/appointments/:id
router.put("/:id", protect, (req, res) => {
  res.json({ message: `Update appointment ${req.params.id} - coming soon` })
})

// @desc  Delete appointment
// @route DELETE /api/appointments/:id
router.delete("/:id", protect, (req, res) => {
  res.json({ message: `Delete appointment ${req.params.id} - coming soon` })
})

module.exports = router