const express = require('express');
const authController = require('../controllers/auth.controller');


const router = express.Router();

router.post('/login', authController.login);
router.post('/reset-password', authController.resetPassword);
// router.post('/logout', authController.logout);
// router.post('/verify-email', authController.verifyEmail);




module.exports = router;