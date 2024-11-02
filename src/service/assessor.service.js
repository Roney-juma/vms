const Assessor = require('../models/assessor.model');
const bcrypt = require('bcrypt');
const Claim = require('../models/claim.model');
const ApiError = require('../utils/ApiError');

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

const getApprovedClaims = async () => {
  return await Claim.find({ status: 'Approved', awardedAssessor: { $exists: false } });
};

const placeBid = async (claimId, assessorId, amount) => {
  const claim = await Claim.findById(claimId);
  if (!claim) throw new ApiError(404, 'Claim not found');

  if (claim.status !== 'Approved') throw new ApiError(400, 'Bids can only be placed on approved claims');

  const existingBid = claim.bids.find((bid) => bid.assessorId.toString() === assessorId);
  if (existingBid) throw new ApiError(400, 'You have already placed a bid on this claim');

  const newBid = {
    bidderType: 'assessor',
    assessorId,
    amount,
    bidDate: new Date(),
    status: 'pending',
  };

  claim.bids.push(newBid);
  await claim.save();

  return claim;
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
  resetPassword
};
