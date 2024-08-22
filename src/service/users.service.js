const AWS = require('aws-sdk');
const moment = require('moment')
const User  = require('../models/users.model');
const { ObjectId } = require("mongodb");
const ApiError = require('../utils/ApiError');
const axios = require('axios')
const CryptoJS = require("crypto-js")
const CENTRAL_URL = process.env.CENTRAL_URL;
const SECRET_KEY = process.env.SECRET_KEY
const pagination = require('../middlewares/paginate');
const { transform, isObject, isEqual, isArray, forEach } = require('lodash')
const _ = require('lodash')
const Speakeasy = require("speakeasy")
const { sendEmail } = require("../middlewares/email");
const sendSms = require("../helper/sms_helper");
const { Workbook } = require('exceljs');
const nationalities = require('@dropdowns/nationalities/json/nationalities.json')
const { logRequest } = require('../middlewares/logger.middleware');
// const { createCanvas } = require('canvas')
const ID = process.env.SECRET_ID_AWS;
const SECRET = process.env.SECRET_KEY_AWS;
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const config = require("../config/config")
const { generate } = require("./token.service")


/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
    return User.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id, project = {}) => {
    return await User.findById(id, project);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
    return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
    const user = await getUserById(userId);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }
    return User.findOneAndUpdate({ _id: ObjectId(user._id) }, { $set: updateBody }, { new: true });
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
    let user = await User.findByIdAndUpdate({ "_id": ObjectId(userId) }, { is_deleted: true })
    if (!user) {
        throw new ApiError(404, "Unable to delete User")
    }
    return user;
}

// Update a user on the ID
const updateUserOnId = async (userId, updateUserBody) => {
    const userResult = await getUserById(userId);
    if (!userResult) {
        throw new ApiError(404, 'User Not found');
    }
    return User.findOneAndUpdate({ _id: ObjectId(userId) }, { $set: updateUserBody }, { new: true });
}
module.exports = {
    createUser,
    getUserById,
    getUserByEmail,
    updateUserById,
    deleteUserById,
    updateUserOnId,
};
