const customerModel = require("../models/customerModel");
const Garage = require('../models/garage.model');
const Assessor = require('../models/assessor.model.js');
const bcrypt = require('bcrypt')
const ApiError = require('../utils/ApiError.js');

async function createCustomer(cus) {
    const existingGarage = await Garage.findOne({ email: cus.email });
    const existingCustomer = await customerModel.findOne({ email: cus.email });
    const existingAssessor = await Assessor.findOne({ email: cus.email });
    if (existingGarage || existingCustomer || existingAssessor) {
      return res.status(409).json({ message: 'We Already have a user with this Email' });
    }
  
  if (existingCustomer) {
    throw new Error('Customer already exists');
  }

  const password = await bcrypt.hash(cus.password, 10);
  cus.password = password;

  // Create new customer
  return await customerModel.create(cus);
}
async function getCustomers() {
  return await customerModel.find();
}
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await getUserByEmail(email);
  const authorized = await user.isPasswordMatch(password);
  if (!authorized) {
      return false
  }

  return user;
};


const getUserByEmail = async (email) => {
  try {
    // Use findOne to retrieve a single user document
    const user = await customerModel.findOne({ email: email });
    return user;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw error;
  }
};
module.exports = { createCustomer, loginUserWithEmailAndPassword,getCustomers};
