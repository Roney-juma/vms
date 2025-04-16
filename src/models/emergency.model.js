const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const emergencySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: Schema.Types.ObjectId, ref: 'Provider' },
  type: { 
    type: String, 
    required: true,
    enum: ['mechanical', 'medical', 'accident', 'fuel', 'other']
  },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  description: String,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'en_route', 'on_site', 'completed', 'cancelled'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
  acceptedAt: Date,
  completedAt: Date
}, { timestamps: true });

emergencySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Emergency', emergencySchema);