const tokenService = require('./token.service');
const assesorService = require('./assesor.service');
const ApiError = require('../utils/ApiError.js');

const loginUserWithEmailAndPassword = async (email, password) => {
    const user = await assesorService.getUserByEmail(email);
    const authorized = await user.isPasswordMatch(password);
    if (!authorized) {
        return false
    }

    return user;
};


module.exports = {
    loginUserWithEmailAndPassword
};