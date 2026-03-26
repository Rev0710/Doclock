const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');

if (process.env.NODE_ENV !== 'production') {
  require("dotenv").config();
}

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

const app = express();

// Middleware
app.use(cors({
  origin: ["https://doclock.vercel.app", "http://localhost:3000", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- UPDATED MONGODB CONNECTION LOGIC ---
const connectDB = async () => {
  // If already connected, don't try to connect again (Crucial for Vercel)
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // Helps avoid long "buffering" hangs
      serverSelectionTimeoutMS: 5000, 
    });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    // In production, we want to know if the connection failed immediately
    throw new Error("Database connection failed");
  }
};

// Middleware to ensure DB is connected before any route is processed
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ message: "Database connection error" });
  }
});
// ----------------------------------------

// Routes
app.get("/", (req, res) => res.json({ message: "DocLock API is running" }));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/appointments", appointmentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// Only listen if running locally
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export for Vercel
module.exports = app;