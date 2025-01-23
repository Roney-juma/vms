const Garage = require('../models/garage.model');
const Claim = require('../models/claim.model');
const Assessor = require('../models/assessor.model');
const customerModel = require("../models/customerModel");
const bcrypt = require('bcrypt');
const emailService = require("./email.service");
const tokenService = require("./token.service");

const createGarage = async (garage) => {
  const plainPassword = garage.password;

  const existingGarage = await Garage.findOne({ email: garage.email });
  const existingCustomer = await customerModel.findOne({ email: garage.email });
  const existingAssessor = await Assessor.findOne({ email: garage.email });
  if (existingGarage || existingCustomer || existingAssessor) {
    throw new Error('We Already have a user with this Email');
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  garage.password = hashedPassword;

  // Create and save the new Garage
  const newGarage = new Garage(garage);
  const savedGarage = await newGarage.save();

  // Send email notification
  if (savedGarage && savedGarage.email) {
    await emailService.sendEmailNotification(
      savedGarage.email,
      'Welcome to Ave Insurance - Your New Account Details',
      `Dear ${savedGarage.name},

We are delighted to welcome you to Ave Insurance! Your new account has been successfully created.

Here are your account details:

- Name: ${savedGarage.name}
- Email: ${savedGarage.email}
- Password: ${plainPassword}

You can log in to your account using your registered email address. Please contact us if you have any questions or need further assistance.

Thank you for choosing Ave Insurance.

Best Regards,
Admin Team`
    );
  }

  return savedGarage;
};

const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await Garage.findOne({ email });
  if (!user) return null;

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return null;

  return user;
};

const getAllGarages = async () => {
  return await Garage.find();
};

const getGarage = async (garageId) => {
  return await Garage.findById(garageId);
};

const updateGarage = async (garageId, updateData) => {
  return await Garage.findByIdAndUpdate(garageId, updateData, { new: true });
};

const deleteGarage = async (garageId) => {
  return await Garage.findByIdAndDelete(garageId);
};

const getAssessedClaims = async () => {
  return await Claim.find({ status: 'Garage', awardedGarage: { $exists: false } });
};

const placeBid = async (claimId, garageId, parts) => {
  const claim = await Claim.findById(claimId);
  if (!claim) throw new Error('Claim not found');

  if (claim.status !== 'Garage') {
    throw new Error('Bids can only be placed on Garage claims');
  }

  const existingBid = claim.bids.find(
    (bid) => bid.garageId && bid.garageId.toString() === garageId
  );
  if (existingBid) {
    throw new Error('You have already placed a bid on this claim');
  }
  const totalCost = parts.reduce((total, part) => total + part.cost, 0);
  const garage = await Garage.findById(garageId);

  const newBid = {
    bidderType: 'garage',
    ratings: garage.ratings.averageRating,
    garageDetails: {
      pendingWork: garage.pendingWork,
      ratings: garage.ratings,
      location: garage.location,
    },
    garageId,
    parts,
    totalCost,
    bidDate: new Date(),
    status: 'pending',
  };
  claim.bids.push(newBid);
  await claim.save();

  if (garage && garage.email) {
    await emailService.sendEmailNotification(
      garage.email,
      'New Bid Placed',
      `Dear ${garage.name},\n\nYou have successfully placed a bid of ${totalCost} on claim ID: ${claim._id}. The following parts are included in your bid:\n\n${parts
        .map((part) => `${part.partName}: ${part.cost}`)
        .join('\n')}\n\nThank you for your participation.`
    );
  }
  const response = {
    claim,
    garageDetails: {
      pendingWork: garage.pendingWork,
      ratings: garage.ratings,
      location: garage.location,
    },
  };

  return response;
};

// Call for Re-Assessment
const callForReAssessment = async (claimId) => {
  const claim = await Claim.findById(claimId);
  if (!claim) throw new Error('Claim not found');
  if (claim.status !== 'Repair') throw new Error('Claim must be in Repair to call for re-assessment');

  claim.status = 'Re-Assessment';
  claim.repairDate = new Date();
  await claim.save();
  if (claim.awardedAssessor && claim.awardedAssessor.assessorId) {
    const assessor = await Assessor.findById(claim.awardedAssessor.assessorId);
    if (assessor && assessor.email) {
      await emailService.sendEmailNotification(
        assessor.email,
        'Verification Required - Repair Completed',
        `Dear ${assessor.name},

The repair for the claim with ID: ${claim._id} has been completed. Please visit the location to verify that the vehicle has been fully repaired.

Thank you for your prompt attention to this matter.

Best Regards,
Admin Team`
      );
    }
  }

  return claim;
};

const getGarageBids = async (garageId) => {
  const claims = await Claim.find({
    $or: [
      { 'bids.bidderType': 'garage', 'bids.garageId': garageId },
      { 'awardedGarage.garageId': garageId },
    ],
  });

  const garageBids = [];

  claims.forEach((claim) => {
    // Filter bids where the garageId matches
    const filteredBids = claim.bids.filter(
      (bid) =>
        bid.bidderType === 'garage' && bid.garageId.toString() === garageId
    );

    filteredBids.forEach((bid) => {
      garageBids.push({
        claimId: claim._id,
        bidId: bid._id,
        amount: bid.amount,
        status: bid.status,
        bidDate: bid.bidDate,
        claimStatus: claim.status,
        vehicleType: claim.vehiclesInvolved?.[0] || 'Unknown',
      });
    });

    // Add claims where the garageId matches awardedGarage
    if (
      claim.awardedGarage &&
      claim.awardedGarage.garageId.toString() === garageId
    ) {
      garageBids.push({
        claimId: claim._id,
        bidId: null, // No specific bid for awardedGarage
        amount: claim.awardedGarage.awardedAmount,
        status: 'awarded',
        bidDate: claim.awardedGarage.awardedDate,
        claimStatus: claim.status,
        vehicleType: claim.vehiclesInvolved?.[0] || 'Unknown',
      });
    }
  });

  if (garageBids.length === 0) throw new Error('No bids found for this Garage');

  return garageBids;
};

const resetPassword = async (email, newPassword) => {
  const user = await Garage.findOne({ email });
  if (!user) {
    throw new Error('User Does not Exist');
  }

  // const isTokenValid = await bcrypt.compare(token, user.resetPasswordToken);
  // if (!isTokenValid || user.resetPasswordExpires < Date.now()) {
  //     throw new Error('Token is invalid or expired');
  // }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;

  // Clear reset token and expiration
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  return { message: 'Password has been reset successfully' };
};


module.exports = {
  createGarage,
  loginUserWithEmailAndPassword,
  getAllGarages,
  getGarage,
  updateGarage,
  deleteGarage,
  getAssessedClaims,
  placeBid,
  callForReAssessment,
  getGarageBids,
  resetPassword
};
