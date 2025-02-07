const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  currentToken: { type: String, default: null },
  role: { type: String, enum: [ "admin", "customer"], default: "customer" },
  createdAt: { type: Date, default: Date.now },
  otp: { type: String, required: false }, 
  otpCreatedAt: { type: Date, required: false }, 
  otpSecret: { type: String, required: false }, 
});

userSchema.index({ email: 1, role: 1 });

module.exports = mongoose.model("User", userSchema);
