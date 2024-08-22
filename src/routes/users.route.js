const express = require('express');

const router = express.Router();
const userController = require("../controllers/users.controller");


router.get('/',userController.getAllUsers)
router.post('/create', userController.createUser)
router.patch('/update/:id',userController.updateAdminUser)
router.delete('/:id', userController.getAdminUser)
router.patch('/delete/:id', userController.deleteAdminUser)




module.exports = router;
