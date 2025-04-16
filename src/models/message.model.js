const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  emergency: { type: Schema.Types.ObjectId, ref: 'Emergency', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['text', 'image', 'voice'] 
  },
  read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);