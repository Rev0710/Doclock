require("dotenv").config();

const { applyMongoDnsWorkaround } = require("./config/dns");
applyMongoDnsWorkaround();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

const app = express();

const ALLOWED_ORIGINS = [
  "https://doclock.vercel.app",
  "https://doclock-v63v.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
];

function allowCorsOrigin(origin, callback) {
  if (!origin) {
    callback(null, true);
    return;
  }
  if (ALLOWED_ORIGINS.includes(origin)) {
    callback(null, true);
    return;
  }

  const clientUrl = process.env.CLIENT_URL?.replace(/\/$/, "");
  if (clientUrl && origin === clientUrl) {
    callback(null, true);
    return;
  }

  if (/^https:\/\/[\w-]+\.vercel\.app$/i.test(origin)) {
    callback(null, true);
    return;
  }

  if (origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) {
    callback(null, true);
    return;
  }

  callback(null, false);
}

app.use(
  cors({
    origin: allowCorsOrigin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json({ limit: "8mb" }));
app.use(express.urlencoded({ extended: true, limit: "8mb" }));

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection error:", err.message);
    res.status(503).json({
      message: "Database temporarily unavailable",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "DocLock API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/appointments", appointmentRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = app;
