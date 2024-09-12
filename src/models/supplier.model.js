const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  location: { type: String, required: true },
  company: { type: String, required: true },
  ratings: { type: Number, min: 0, max: 5 },
  partsAvailable: [{ type: String }] 
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
