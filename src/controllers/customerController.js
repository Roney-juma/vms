const Claim = require('../models/claim.model');
const Customer = require("../models/customerModel");
const customerService = require("../service/customerService");
const authService = require("../service/auth.service");
const tokenService = require("../service/token.service");
const emailService = require("../service/email.service");


async function createCustomer(req, res) {
  try {
    // Create the customer using the provided service
    const customerCreated = await customerService.createCustomer(req.body);

    if (customerCreated && customerCreated.email) {
      // Notify the customer with their new account details
      await emailService.sendEmailNotification(
        customerCreated.email,
        'Welcome to Ave Insurance - Your New Account Details',
        `Dear ${customerCreated.firstName} ${customerCreated.lastName},

We are delighted to welcome you to Ave Insurance! Your new account has been successfully created.

Here are your account details:

- Name: ${customerCreated.firstName} ${customerCreated.lastName}
- Email: ${customerCreated.email}
- Address: ${customerCreated.address}
- Phone: ${customerCreated.phone}

You can log in to your account using your registered email address. Please feel free to reach out to our support team if you have any questions or need further assistance.

Thank you for choosing Ave Insurance.

Best Regards,
Admin Team`
      );
    }

    // Respond with the created customer object
    res.status(201).json(customerCreated); // 201 indicates resource created
  } catch (error) {
    console.error('Error creating customer:', error);

    if (error.message === 'Customer already exists') {
      res.status(409).json({ error: 'Customer already exists' }); // Conflict
    } else {
      res.status(500).json({ error: error.message }); // Internal Server Error
    }
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

const getCustomerClaims = async (req, res) => {
  try {
    // Find the customer by ID
    const customerId = req.params.customerId;
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Find all claims associated with this customer
    const claims = await Claim.find({ 'claimant.email': customer.email });

    // If no claims are found, return a message
    if (claims.length === 0) {
      return res.status(404).json({ message: 'No claims found for this customer' });
    }

    // Respond with the list of claims
    res.status(200).json(claims);
  } catch (error) {
    console.error('Error fetching customer claims:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createCustomer,
  login,
  getAllCustomers,
  getCustomerClaims,
};
