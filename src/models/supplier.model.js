const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  location: { type: String, required: true },
  company: { type: String, required: true },
  ratings: { type: Number, min: 0, max: 5 },
  password: {
    type: String,
    required: true,
  },
  partsAvailable: [{ type: String }] 
}, { timestamps: true });

supplierSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

module.exports = mongoose.model('Supplier', supplierSchema);
