const User = require('../models/user');

/** Requires protect() to run first. Attaches nothing; only checks role. */
async function doctorOnly(req, res, next) {
  try {
    const u = await User.findById(req.user.id).select('role').lean();
    if (!u || u.role !== 'doctor') {
      return res.status(403).json({ message: 'Doctor access only' });
    }
    next();
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { doctorOnly };
