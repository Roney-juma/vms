const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

const garageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    email:{ type: String, required: true },
    password: {
      type: String,
      required: true,
    },
    contactNumber: { type: String, required: true },
    accountType:{
      type: String,
      default: 'Garage',
    },
    email: { type: String, required: true },
    services: [{ type: String }],
    rating: { type: Number, min: 1, max: 5, default: 0 },
  }, { timestamps: true });

  garageSchema.methods.isPasswordMatch = async function (password) {
    const user = this;
    return bcrypt.compare(password, user.password);
  };
  
  module.exports = mongoose.model('Garage', garageSchema);
  