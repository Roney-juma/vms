const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

const customerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },

    email: {
      type: String,
      unique: true,
      required: true,
    },
    username: {
      type: String,
      unique: true,
    },
    phone: {
      type: String,
    },
    policyNumber: { 
      type: String, 
      required: true, 
      unique: true },
    policyType: { 
        type: String, 
        required: true, 
      },
    Insurer: { 
        type: String, 
        required: true, 
      },
    password: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
  },
  },
  {
    timestamps: true,
  }
);

customerSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};
const customer = mongoose.model("customer", customerSchema);
module.exports = customer;
