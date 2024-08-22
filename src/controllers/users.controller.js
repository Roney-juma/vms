const express = require('express');
const User = require('../models/users.model');

// Create a new admin user
const createUser = async (req, res) => {
  try {
    const { username, password, fullName, email, role } = req.body;
    const newAdminUser = new User({
      username,
      password, // Remember to hash this password before saving!
      fullName,
      email,
      role
    });
    const savedAdminUser = await newAdminUser.save();
    res.status(201).json(savedAdminUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
    createUser,
    getAllUsers,
    getAdminUser,
    updateAdminUser,
    deleteAdminUser
};
