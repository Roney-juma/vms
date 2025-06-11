const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  visitor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visitor',
    required: true
  },
  action: {
    type: String,
    enum: ['check-in', 'check-out', 'pre-register', 'update'],
    required: true
  },
  details: {
    type: Object
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Log', LogSchema);