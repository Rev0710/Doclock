const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
}, 
{ timestamps: true });

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