const mongoose = require("mongoose");

const garageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String, required: true },
    services: [{ type: String }],
    rating: { type: Number, min: 1, max: 5, default: 0 },
  }, { timestamps: true });
  
  module.exports = mongoose.model('Garage', garageSchema);
  