const tokenService = require('./token.service');
const assesorService = require('./assesor.service');
const ApiError = require('../utils/ApiError.js');

const loginUserWithEmailAndPassword = async (email, password) => {
    const user = await assesorService.getUserByEmail(email);
    const authorized = await user.isPasswordMatch(password);
    console.log("authorized", authorized)
    if (!authorized) {
        incrementLoginAttempt(user);
        throw new ApiError(401, 'Incorrect email or password');
    }

    return user;
};


module.exports = {
    loginUserWithEmailAndPassword
};