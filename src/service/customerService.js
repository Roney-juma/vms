const customerModel = require("../models/customerModel");
const bcrypt = require('bcrypt')

async function createCustomer(cus) {
  
  const password = await bcrypt.hash(cus.password,10)
  console.log("customerCreated3",password);
  cus.password = password
  return await customerModel.create(cus);
}
async function getCustomers() {
  return await customerModel.find();
}


async function login(email, passsword) {
  const matches = await customerModel.find({ email: email });
  if ( await bcrypt.compare(passsword,matches[0].password)) {
    const matches = await customerModel.find({ email: email }, {password: 0});
    const userDetails = matches[0];
    return userDetails;
  } 
  else {
    return "Invalid email/password";
  }
}
module.exports = { createCustomer, login,getCustomers};
