const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

function extractBearerToken(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.split(" ")[1];
}

const protect = (req, res, next) => {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const rawId = decoded.id ?? decoded._id ?? decoded.userId;
    const id = rawId != null ? String(rawId).trim() : "";

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }

    req.user = { id, _id: id };
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

module.exports = { protect };
