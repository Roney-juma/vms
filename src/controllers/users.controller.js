const express = require('express');
const User = require('../models/users.model');

const authService = require("../service/auth.service");
const tokenService = require("../service/token.service");
const emailService = require("../service/email.service");


const login =
    async (req, res) => {
        const { email, password } = req.body;
        const user = await authService.loginUserWithEmailAndPassword(email, password);
        const tokens = tokenService.GenerateToken(user);
        res.send({ user, tokens });
    };


const createUser = async (req, res) => {
  try {
    const { username, password, fullName, email, role } = req.body;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this username or email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword, 
      fullName,
      email,
      role
    });

    const savedUser = await newUser.save();

    // Send email notification with account details
    if (savedUser && savedUser.email) {
      await emailService.sendEmailNotification(
        savedUser.email,
        'Welcome to Ave Insurance - Your Account Details',
        `Dear ${savedUser.fullName},

Welcome to Ave Insurance! Your account has been successfully created.

Here are your account details:
- Username: ${savedUser.username}
- Email: ${savedUser.email}

Please use your registered email and the password you set during registration to log in.

If you have any questions, feel free to contact us.

Best Regards,
Admin Team`
      );
    }

    
    res.status(201).json(savedUser); 
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Get all users
const getAllUsers = async (req, res) => {
  try {
    const adminUsers = await User.find();
    res.status(200).json(adminUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific admin user
const getAdminUser = async (req, res) => {
  try {
    const adminUser = await User.findById(req.params.id);
    if (!adminUser) {
      return res.status(404).json({ message: 'Admin user not found' });
    }
    res.status(200).json(adminUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an admin user
const updateAdminUser = async (req, res) => {
  try {
    const updatedAdminUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedAdminUser) {
      return res.status(404).json({ message: 'Admin user not found' });
    }
    res.status(200).json(updatedAdminUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an admin user
const deleteAdminUser = async (req, res) => {
  try {
    const deletedAdminUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedAdminUser) {
      return res.status(404).json({ message: 'Admin user not found' });
    }
    res.status(200).json({ message: 'Admin user deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
    login,
    createUser,
    getAllUsers,
    getAdminUser,
    updateAdminUser,
    deleteAdminUser
};
