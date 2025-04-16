const bcrypt = require('bcrypt');
const User = require('../models/users.model');
const emailService = require('./email.service');
const mongoose = require('mongoose');


const createUser = async (userData) => {
    const { firstName, lastName, password, fullName, email, role, phone, department, position } = userData;

    try {
        // Validate required fields
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error('A user with this email already exists');
        }

        // Create new user
        const newUser = new User({
            firstName,
            lastName,
            password, // Will be hashed by pre-save hook
            fullName: fullName || `${firstName} ${lastName}`,
            email,
            role,
            phone,
            department,
            position
        });

        // Save user
        const savedUser = await newUser.save();

        // Generate a temporary password for display (not the actual stored password)
        const tempPasswordDisplay = password.length > 4 
            ? `${password.substring(0, 2)}****${password.slice(-2)}`
            : '****';

        // Send welcome email
        if (savedUser.email) {
            await emailService.sendEmailNotification(
                savedUser.email,
                'Welcome to Road Rescue - Your Account is Ready!',
                `Dear ${savedUser.firstName },

Welcome to Road Rescue! We're thrilled to have you on board.

Your account has been successfully created with the following details:
- Email: ${savedUser.email}
- Temporary Password: ${tempPasswordDisplay}

For security reasons:
1. Please change your password after first login
2. Never share your credentials with anyone

Getting Started:
1. Login at: ${process.env.APP_URL}/login
2. Complete your profile
3. Explore our services

Need Help?
- Support Email: support@roadrescue.com
- Phone: ${process.env.SUPPORT_PHONE}

Thank you for choosing Road Rescue - Your trusted partner in emergency road assistance.

Best regards,
The Road Rescue Team
`
            );
        }

        // Return user data without sensitive information
        const userToReturn = savedUser.toObject();
        delete userToReturn.password;
        delete userToReturn.__v;

        return userToReturn;

    } catch (error) {
        console.error('User creation failed:', error);
        throw new Error(`User registration failed: ${error.message}`);
    }
};

const getAllUsers = async () => {
    return await User.find();
};

const getUserById = async (userId) => {

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID');
    }
    console.log("User ID:", userId);

    return await User.findById(userId);
};



const updateUser = async (userId, updateData) => {
    return await User.findByIdAndUpdate(userId, updateData, { new: true });
};

const deleteUser = async (userId) => {
    return await User.findByIdAndDelete(userId);
};

const resetPassword = async (email, newPassword) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return { message: 'Password has been reset successfully' };
};
const loginUserWithEmailAndPassword = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) {
        console.log("User not found");
        return false;
    }
    console.log("User found", user);

    return user;
};


module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    resetPassword,
    loginUserWithEmailAndPassword
};
