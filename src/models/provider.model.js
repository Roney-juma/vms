const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const providerSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  serviceType: {
    type: String,
    required: true,
    enum: ['garage', 'ambulance', 'police', 'fuel', 'tow_truck']
  },
  companyName: String,
  contactNumber: { type: String, required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  isAvailable: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  serviceRadius: { type: Number, default: 10000 } // in meters
}, { timestamps: true });

providerSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Provider', providerSchema);