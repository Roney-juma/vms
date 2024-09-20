const express = require('express');

const router = express.Router();
const userController = require("../controllers/users.controller");


router.get('/',userController.getAllUsers)
router.post('/create', userController.createUser)
router.post('/login', userController.login)
router.patch('/update/:id',userController.updateAdminUser)
router.delete('/:id', userController.getAdminUser)
router.patch('/delete/:id', userController.deleteAdminUser)
router.post('/reset-password', userController.resetPassword);




module.exports = router;
