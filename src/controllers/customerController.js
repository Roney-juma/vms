
const customerService = require("../service/customerService");

async function createCustomer(req, res) {
  console.log("customerCreated");
  try {
    console.log("customerCreated1");
    const customerCreated = await customerService.createCustomer(req.body);

    res.status(200).json(customerCreated);
  } catch (error) {
    res.status(500).json({ error: error.message });
    // crossOriginIsolated.log({error: error.message})
    // res.json({ error: error.message });
  }
}

async function loginCustomer(req, res) {
  try {
    const password = req.body.password
    const email = req.body.email

    const user = await customerService.login(email, password);
    console.log("user",user)
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
const getAllCustomers = async (req, res) => {
  try {
    const customers = await customerService.getCustomers();
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCustomer,
  loginCustomer,
  getAllCustomers
};
