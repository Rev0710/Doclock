const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./config/db");

require("dotenv").config(); // always load env

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "https://doclock.vercel.app",
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB connect
connectDB();

// Routes
app.get("/", (req, res) => res.json({ message: "DocLock API is running" }));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/appointments", appointmentRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// ✅ IMPORTANT FIX: Render needs this always
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));