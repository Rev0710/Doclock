const mongoose = require("mongoose");

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
}, 
{ timestamps: true });



module.exports = mongoose.models.User || mongoose.model("User", userSchema);