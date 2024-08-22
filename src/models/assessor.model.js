const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const assessorSchema = new Schema({
  name: { type: String, required: true },
  contactInfo: {
    phone: { type: String, required: true },
    email: { type: String, required: true }
  },
  licenseNumber: { type: String},
  experience: { type: Number, },
  specialties: [String], 
  ratings: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const Assessor =  mongoose.model('Assessor', assessorSchema);
module.exports = Assessor;
