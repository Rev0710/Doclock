const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const bloodPressureReadingSchema = new mongoose.Schema(
  {
    systolic: { type: Number, required: true, min: 40, max: 300 },
    diastolic: { type: Number, required: true, min: 20, max: 200 },
    recordedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const labResultSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
    unit: { type: String, default: "" },
    flag: {
      type: String,
      enum: ["normal", "high", "low", "abnormal", ""],
      default: "normal",
    },
    recordedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const medicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    dosage: { type: String, default: "" },
    frequency: { type: String, default: "" },
    startDate: { type: Date },
    active: { type: Boolean, default: true },
  },
  { _id: false }
);

const healthProfileSchema = new mongoose.Schema(
  {
    heightCm: { type: Number, min: 50, max: 280, default: null },
    weightKg: { type: Number, min: 2, max: 500, default: null },
    weightRecordedAt: { type: Date },
    bloodPressureReadings: { type: [bloodPressureReadingSchema], default: [] },
    labResults: { type: [labResultSchema], default: [] },
    medications: { type: [medicationSchema], default: [] },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,     
    required: true
  },
  role: {
    type: String,
    default: "user"
  },
  specialty: {
    type: String,
  },
  availabilityDays: {
    type: String,
  },
  availabilityHours: {
    type: String,
  },
  address: { 
    type: String 
  },
  city: { 
    type: String 
  },
  state: { 
    type: String 
  },
  zipCode: { 
    type: String 
  },
  country: { 
    type: String 
  },
  gender: { 
    type: String 
  },
  birthDate: { 
    type: Date 
  },
  /** Data URL or https URL — set via PUT /users/profile or upload flow */
  avatar: {
    type: String,
    default: "",
  },
  healthProfile: {
    type: healthProfileSchema,
    default: undefined,
  },
}, 
{ timestamps: true });

userSchema.index({ role: 1 });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const pwd = this.password;
  if (typeof pwd === "string" && /^\$2[aby]\$\d{2}\$/.test(pwd)) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(pwd, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    if (ret.role !== "doctor") {
      delete ret.availabilityDays;
      delete ret.availabilityHours;
      delete ret.specialty;
    }
    return ret;
  },
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);