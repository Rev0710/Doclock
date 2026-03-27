const User = require("../models/user");
const Appointment = require("../models/appointmentModel");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

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
    const user = await User.create({ name, email, phone, password, role });
    const token = generateToken(user._id);
    res.status(201).json({ success: true, message: "Account created", token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = generateToken(user._id);
    res.status(200).json({ success: true, token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const bookAppointment = async (req, res) => {
  try {
    const { date, time, service } = req.body;
    const appointment = await Appointment.create({
      user: req.user.id,
      date,
      time,
      service,
    });
    res.status(201).json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user.id });
    res.status(200).json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ message: "Error fetching appointments" });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!appointment) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    if (!appointment) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ success: true, message: "Appointment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
    registerUser, 
    loginUser, 
    getMe, 
    bookAppointment, 
    getMyAppointments,
    updateAppointment,
    deleteAppointment
};