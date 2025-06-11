const express = require('express');
const advancedResults = require('../middleware/advancedResults');
const router = express.Router();
const {
  register,
  login,
  getMe,
  getUsers,
  getUser,
  updateUser,
  deleteUser
} = require('../controllers/user.controller');
const User = require('../models/user.model');

// Public routes
router.post('/register', register);
router.post('/login', login);

router
  .route('/')
  .get(advancedResults(User), getUsers);

router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;