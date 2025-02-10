const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ["card", "paypal"], required: true },
  status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

paymentSchema.index({ createdAt: -1, method: 1 });

module.exports = mongoose.model("Payment", paymentSchema);
