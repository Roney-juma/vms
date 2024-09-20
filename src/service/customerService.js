const Customer = require("../models/customerModel.js");
const Garage = require('../models/garage.model');
const Assessor = require('../models/assessor.model.js');
const Claim = require('../models/claim.model');
const bcrypt = require('bcrypt')
const ApiError = require('../utils/ApiError.js');
const emailService = require("../service/email.service");
const tokenService = require("../service/token.service");

async function createCustomer(cus) {
    const existingGarage = await Garage.findOne({ email: cus.email });
    const existingCustomer = await Customer.findOne({ email: cus.email });
    const existingAssessor = await Assessor.findOne({ email: cus.email });
    if (existingGarage || existingCustomer || existingAssessor) {
      throw new Error('We already have this Email in the System');
    }
  
  if (existingCustomer) {
    throw new Error('Customer already exists');
  }

  const password = await bcrypt.hash(cus.password, 10);
  cus.password = password;

  // Create new customer
  return await Customer.create(cus);
}
const loginUser = async (email, password) => {
  const user = await Customer.findOne({ email });
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new Error("Invalid email or password");
  }
  const tokens = tokenService.GenerateToken(user);
  return { user, tokens };
};

const getCustomers = async () => {
  return await Customer.find();
};

const getCustomerClaims = async (customerId) => {
  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw new Error('Customer not found');
  }

  const claims = await Claim.find({ 'claimant.email': customer.email });
  if (claims.length === 0) {
    throw new Error('No claims found for this customer');
  }

  return claims;
};
const sendWelcomeEmail = async (customer) => {
  const subject = 'Welcome to Ave Insurance - Your New Account Details';
  const message = `
    Dear ${customer.firstName} ${customer.lastName},

    We are delighted to welcome you to Ave Insurance! Your new account has been successfully created.

    Here are your account details:
    - Name: ${customer.firstName} ${customer.lastName}
    - Email: ${customer.email}
    - Phone: ${customer.phone}

    You can log in to your account using your registered email address. Please feel free to reach out to our support team if you have any questions or need further assistance.

    Thank you for choosing Ave Insurance.

    Best Regards,
    Admin Team
  `;

  await emailService.sendEmailNotification(customer.email, subject, message);
};

const resetPassword = async (email, newPassword) => {
  const user = await Customer.findOne({ email });
  if (!user) {
      throw new Error('Invalid request');
  }

  // const isTokenValid = await bcrypt.compare(token, user.resetPasswordToken);
  // if (!isTokenValid || user.resetPasswordExpires < Date.now()) {
  //     throw new Error('Token is invalid or expired');
  // }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;

  // Clear reset token and expiration
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  return { message: 'Password has been reset successfully' };
};

module.exports = {
  createCustomer,
  loginUser,
  getCustomers,
  getCustomerClaims,
  sendWelcomeEmail,
  resetPassword,
};

