
const customerService = require("../service/customerService");
const authService = require("../service/auth.service");
const tokenService = require("../service/token.service");
const emailService = require("../service/email.service");

async function createCustomer(req, res) {
  
  try {
    const customerCreated = await customerService.createCustomer(req.body);

    res.status(200).json(customerCreated);
  } catch (error) {
    res.status(500).json({ error: error.message });
    // crossOriginIsolated.log({error: error.message})
    // res.json({ error: error.message });
  }
}


const login =
    async (req, res) => {
        const { email, password } = req.body;
        const user = await customerService.loginUserWithEmailAndPassword(email, password);
        if (!user) {
          return res.status(401).json({ message: "Invalid email or password" });
          }
        const tokens = tokenService.GenerateToken(user);
        res.send({ user, tokens });
    };

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
  login,
  getAllCustomers
};
