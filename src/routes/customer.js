// const customerController = require("../controllers/customerController")
// const express = require("express")

// const router = express.Router()

// router.get("/", customerController.welcome)
// router.post("/register", customerController.createCustomer)


// module.exports = router
const express = require("express");
const customerController = require("../controllers/customerController")
const router = express.Router();



router.post("/register", customerController.createCustomer)
router.post("/login", customerController.loginCustomer)
router.get("/", customerController.getAllCustomers)

module.exports = router;