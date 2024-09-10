const Garage = require('../models/garage.model');
const ApiError = require('../utils/ApiError.js');


const loginUserWithEmailAndPassword = async (email, password) => {
    const user = await getUserByEmail(email);
    if (!user) {
        throw new Error('User not found');
        }

    const authorized = await user.isPasswordMatch(password);
    if (!authorized) {
        return false
    }
  
    return user;
  };
  
  
  const getUserByEmail = async (email) => {
    try {
      // Use findOne to retrieve a single user document
      const user = await Garage.findOne({ email: email });
      return user;
    } catch (error) {
      console.error("Error fetching user by email:", error);
      throw error;
    }
  };

module.exports = { loginUserWithEmailAndPassword }