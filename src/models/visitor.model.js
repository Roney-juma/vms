const mongoose = require('mongoose');

const VisitorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  purpose: {
    type: String,
    required: true
  },
  company: {
    type: String
  },
  idType: {
    type: String,
    enum: ['Driving License', 'Passport', 'National ID', 'Other'],
    required: true
  },
  idNumber: {
    type: String,
    required: true
  },
  checkIn: {
    type: Date,
    default: Date.now
  },
  checkOut: {
    type: Date
  },
  status: {
    type: String,
    enum: ['checked-in', 'checked-out'],
    default: 'checked-in'
  },
  image: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Visitor', VisitorSchema);