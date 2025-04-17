const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const subtypeEnums = require('../constants/serviceSubTypes');

const providerSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  serviceType: {
    type: String,
    required: true,
    enum: Object.keys(subtypeEnums),
    default: 'other'
  },
  serviceSubType: {
    type: [String],
    validate: {
      validator: function (subtypes) {
        if (!this.serviceType || !Array.isArray(subtypes)) return true;
        const allowed = subtypeEnums[this.serviceType] || [];
        return subtypes.every(sub => allowed.includes(sub));
      },
      message: props => `Invalid serviceSubType value(s) for serviceType '${props.instance.serviceType}'`
    }
  },
  companyName: String,
  contactNumber: { type: String, required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  isAvailable: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  serviceRadius: { type: Number, default: 10000 }
}, { timestamps: true });

providerSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Provider', providerSchema);
