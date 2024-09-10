const Assessor = require('../models/assessor.model');
const bcrypt = require('bcrypt')
const ApiError = require('../utils/ApiError.js');

async function createCustomer(cus) {
  
  const password = await bcrypt.hash(cus.password,10)
  cus.password = password
  return await Assessor.create(cus);
}
async function getCustomers() {
  return await Assessor.find();
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
    const user = await Assessor.findOne({ email: email });
    return user;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw error;
  }
};
module.exports = { createCustomer, loginUserWithEmailAndPassword,getCustomers,getUserByEmail};
