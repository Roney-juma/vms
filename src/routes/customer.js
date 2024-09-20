
const express = require("express");
const customerController = require("../controllers/customerController")
const verifyToken = require("../middlewheres/verifyToken");
const router = express.Router();



router.post("/register", customerController.createCustomer)
router.post("/login", customerController.login)
router.post('/reset-password', customerController.resetPassword);
router.get("/", customerController.getAllCustomers)
router.get('/myClaims/:customerId', customerController.getCustomerClaims)

module.exports = router;