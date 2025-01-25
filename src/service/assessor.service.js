const Assessor = require('../models/assessor.model');
const bcrypt = require('bcrypt');
const Claim = require('../models/claim.model');
const ApiError = require('../utils/ApiError');
const emailService = require("../service/email.service");


const createAssessor = async (assessorData) => {
  const existingUser = await Assessor.findOne({ email: assessorData.email });
  if (existingUser) throw new ApiError(409, 'Assessor already exists');

  assessorData.password = await bcrypt.hash(assessorData.password, 10);
  return await Assessor.create(assessorData);
};

const getAssessors = async () => {
  return await Assessor.find();
};

const getAssessorById = async (id) => {
  const assessor = await Assessor.findById(id);
  if (!assessor) throw new ApiError(404, 'Assessor not found');
  return assessor;
};

const updateAssessor = async (id, assessorData) => {
  const updatedAssessor = await Assessor.findByIdAndUpdate(id, assessorData, { new: true });
  if (!updatedAssessor) throw new ApiError(404, 'Assessor not found');
  return updatedAssessor;
};

const deleteAssessor = async (id) => {
  const deletedAssessor = await Assessor.findByIdAndDelete(id);
  if (!deletedAssessor) throw new ApiError(404, 'Assessor not found');
};

const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await Assessor.findOne({ email });

  if (!user || !(await !(await user.isPasswordMatch(password)))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  return user;
};

const getApprovedClaims = async (assessorId) => {
  const assessor = await Assessor.findById(assessorId);
  if (!assessor) throw new Error('Assessor not found');

  const asseslatitude = assessor.location.latitude
  const asseslongitude = assessor.location.longitude;
  if (!asseslatitude || !asseslatitude || !asseslongitude) {
    throw new Error('Assessor location coordinates are missing');
  }

  const claims = await Claim.find({
    status: 'Approved',
    awardedAssessor: { $exists: false }
  });
  // Filter claims based on proximity to the assessor's location
  const nearbyClaims = claims.filter((claim) => {
    const { latitude, longitude } = claim.incidentDetails;

    if (!latitude || !longitude) return false;

    const distance = getDistanceFromLatLonInKm(
      asseslatitude,
      asseslongitude,
      latitude,
      longitude
    );
    console.log("distance", distance)

    return distance <= 20;
  });

  return nearbyClaims;
};
const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = degToRad(lat2 - lat1);
  const dLon = degToRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degToRad(lat1)) *
    Math.cos(degToRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

const degToRad = (deg) => (deg * Math.PI) / 180;


const placeBid = async (claimId, assessorId, amount, description, timeline) => {

  const claim = await Claim.findById(claimId);
  if (!claim) throw new ApiError(404, 'Claim not found');

  if (claim.status !== 'Approved') throw new ApiError(400, 'Bids can only be placed on approved claims');

  const existingBid = claim.bids.find((bid) => bid.assessorId?.toString() === assessorId);
  if (existingBid) throw new ApiError(400, 'You have already placed a bid on this claim');

  const assessor = await Assessor.findById(assessorId);
  if (!assessor) throw new ApiError(404, 'Assessor not found');
  const pendingWork = await Claim.countDocuments({
    'awardedAssessor.assessorId': assessorId,
    status: { $ne: 'Completed' },
  });

  const newBid = {
    bidderType: 'assessor',
    ratings: assessor.ratings.averageRating,
    assessorId,
    amount,
    description,
    timeline,
    assessorDetails: {
      pendingWork,
      ratings: assessor.ratings,
      location: assessor.location,
    },
    bidDate: new Date(),
    status: 'pending',
  };
  claim.bids.push(newBid);

  await claim.save();
  return {
    amount,
    description,
    timeline,
    assessorDetails: {
      name: assessor.name,
      ratings: assessor.ratings,
      location: assessor.location,
    },
    pendingWork,
  };
};


const getAssessorBids = async (assessorId) => {
  const claims = await Claim.find({ "bids.assessorId": assessorId });

  const assessorBids = [];
  for (const claim of claims) {
    const relevantBids = claim.bids.filter((bid) => bid.assessorId?.toString() === assessorId);
    relevantBids.forEach((bid) => {
      assessorBids.push({
        claimId: claim._id,
        bidId: bid._id,
        amount: bid.amount,
        status: bid.status,
        bidDate: bid.bidDate,
        claimStatus: claim.status,
      });
    });
  }

  if (assessorBids.length === 0) throw new ApiError(404, 'No bids found for this assessor');
  return assessorBids;
};

const submitAssessmentReport = async (claimId, assessmentReport) => {
  const claim = await Claim.findById(claimId);
  if (!claim) throw new ApiError(404, 'Claim not found');
  const parts = assessmentReport.parts.map((part) => {
    return { partName: part, cost: '' }
  })
  assessmentReport.parts = parts


  claim.assessmentReport = assessmentReport;
  claim.status = 'Assessed';
  await claim.save();

  return claim;
};

const resetPassword = async (email, newPassword) => {
  const user = await Assessor.findOne({ email });
  if (!user) {
    throw new Error('Invalid request');
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

const completeRepair = async (claimId) => {
  const claim = await Claim.findById(claimId);
  if (!claim) throw new Error('Claim not found');
  if (claim.status !== 'Re-Assessment') throw new Error('Claim must be under Re-Assessment to mark it as Completed');

  claim.status = 'Completed';
  claim.repairDate = new Date();
  await claim.save();

  if (claim.claimant && claim.claimant.email) {
    await emailService.sendEmailNotification(
      claim.claimant.email,
      'Repair Completed - Verification Pending',
      `Dear ${claim.claimant.name},

We are pleased to inform you that the repair for your claim with ID: ${claim.vehiclesInvolved[0].licensePlate} has been completed.
Please verify that the vehicle has been fully repaired.
If you are satisfied with the repair, please reply to this email to confirm.
Thank you for your patience during this process.

Best Regards,
Admin Team`
    );
  }
  return claim;
};
const rejectRepair = async (claimId, rejectionReason) => {
  const claim = await Claim.findById(claimId);
  if (!claim) throw new Error('Claim not found');
  if (claim.status !== 'Re-Assessment') throw new Error('Claim must be under Re-Assessment to mark it as Rejected');
  claim.status = 'Repair';
  claim.rejectionReason = rejectionReason;
  await claim.save();
  return claim;
};






module.exports = {
  createAssessor,
  getAssessors,
  getAssessorById,
  updateAssessor,
  deleteAssessor,
  loginUserWithEmailAndPassword,
  getApprovedClaims,
  placeBid,
  getAssessorBids,
  submitAssessmentReport,
  resetPassword,
  completeRepair,
  rejectRepair
};
