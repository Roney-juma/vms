const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usersSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    fullName: { 
        type: String,
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    // role: { 
    //     type: mongoose.Schema.Types.ObjectId, 
    //     ref: 'Role'
    // },
    active: { type: Boolean, default: true },
    lastLogin: { type: Date },
    profilePictureUrl: { type: String }
}, { timestamps: true });

// Hash password before saving
usersSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const Users = mongoose.model('Users', usersSchema);
module.exports = Users;
