const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  model: { type: String, required: true },
  brand: { type: String, required: true },
  year: { type: Number, required: true },
  pricePerDay: { type: Number, required: true },
  available: { type: Boolean, default: true },
  quantity: { type: Number, default: 1 },
  img: { type: String, required: true },
  engine: { type: String, default: "N/A" },
  transmission: { type: String, default: "N/A" },
  drive: { type: String, default: "N/A" },
  complectation: { type: String, default: "N/A" },
  createdAt: { type: Date, default: Date.now },
});

carSchema.index({ brand: 1, pricePerDay: -1 });

module.exports = mongoose.model("Car", carSchema);
