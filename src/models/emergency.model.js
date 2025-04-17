const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subtypeEnums = require('../constants/serviceSubTypes');

const emergencySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: Schema.Types.ObjectId, ref: 'Provider' },
  type: {
    type: String,
    required: true,
    enum: Object.keys(subtypeEnums),
    default: 'other'
  },
  serviceSubType: {
    type: [String],
    validate: {
      validator: function (subtypes) {
        if (!this.type || !Array.isArray(subtypes)) return true;
        const allowed = subtypeEnums[this.type] || [];
        return subtypes.every(sub => allowed.includes(sub));
      },
      message: props => `Invalid serviceSubType value(s) for type '${props.instance.type}'`
    }
  },
  vehicleType: {
    type: String,
    enum: ['car', 'truck', 'motorcycle', 'bus', 'other']
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
