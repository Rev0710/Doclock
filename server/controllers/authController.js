const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return res.status(400).json({ message: "An account with this phone number already exists" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("REGISTER ERROR:", error.message);
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ message: `This ${field} is already registered` });
    }
    res.status(500).json({ message: error.message || "Server error during registration" });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("LOGIN ATTEMPT:", email);        // debug line 1

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    console.log("USER FOUND:", user ? "YES" : "NO");  //debug line 2

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = bcrypt.compareSync(password, user.password);

    console.log("PASSWORD MATCH:", isMatch ? "YES" : "NO"); // debug line 3

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error during login" });
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { registerUser, loginUser, getMe };