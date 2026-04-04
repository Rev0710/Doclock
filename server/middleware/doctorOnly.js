const User = require("../models/user");

/**
 * Must run after `protect`. Ensures the signed-in user is a doctor.
 */
async function doctorOnly(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select("role").lean();
    if (!user || user.role !== "doctor") {
      return res.status(403).json({ message: "Doctor access only" });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { doctorOnly };
