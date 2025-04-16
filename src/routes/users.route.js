const express = require('express');

const router = express.Router();
const userController = require("../controllers/users.controller");
const verifyToken = require("../middlewheres/verifyToken");

// router.use(verifyToken())

router.get('/',verifyToken(),userController.getAllUsers)
router.post('/create', userController.createUser)
router.post('/login', userController.login)
// get user profile
router.get('/profile', verifyToken(), userController.getUserProfile)
router.patch('/update/:id',verifyToken(),userController.updateAdminUser)
router.get('/:id',verifyToken(), userController.getAdminUser)
router.patch('/delete/:id', userController.deleteAdminUser)
router.post('/reset-password', userController.resetPassword);




module.exports = router;
