const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
  recipientId: {
    type: Schema.Types.ObjectId,
  },
  recipientType: {
    type: String,
    enum: ['assessor', 'garage', 'supplier'], // Specify the type of recipient
    required: true
  },
  content: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Export the Notification model
const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
