const assessorService = require("../service/assessor.service");
const tokenService = require("../service/token.service");
const emailService = require("../service/email.service");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await assessorService.loginUserWithEmailAndPassword(email, password);
    const tokens = tokenService.GenerateToken(user);
    res.status(200).json({ user, tokens });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const createAssessor = async (req, res) => {
  try {
    const assessorData = req.body;
    const newAssessor = await assessorService.createAssessor(assessorData);

    // Send email notification
    await emailService.sendEmailNotification(
      newAssessor.email,
      'Welcome To Ave Insurance',
      `Dear ${newAssessor.name},\n\nYour account has been created.\nUsername: ${newAssessor.email}`
    );

    res.status(201).json(newAssessor);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const getAllAssessors = async (req, res) => {
  try {
    const assessors = await assessorService.getAssessors();
    res.status(200).json(assessors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAssessorById = async (req, res) => {
  try {
    const assessor = await assessorService.getAssessorById(req.params.id);
    res.status(200).json(assessor);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const updateAssessor = async (req, res) => {
  try {
    const updatedAssessor = await assessorService.updateAssessor(req.params.id, req.body);
    res.status(200).json(updatedAssessor);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const deleteAssessor = async (req, res) => {
  try {
    await assessorService.deleteAssessor(req.params.id);
    res.status(200).json({ message: 'Assessor deleted successfully' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const getApprovedClaims = async (req, res) => {
  try {
    const claims = await assessorService.getApprovedClaims();
    res.status(200).json(claims);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const placeBid = async (req, res) => {
  try {
    const { assessorId, amount } = req.body;
    const claim = await assessorService.placeBid(req.params.id, assessorId, amount);

    // Notify the assessor
    const assessor = await assessorService.getAssessorById(assessorId);
    await emailService.sendEmailNotification(
      assessor.email,
      'New Bid Placed',
      `You have successfully placed a bid of ${amount} on claim ID: ${claim._id}.`
    );

    res.status(201).json(claim);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const getAssessorBids = async (req, res) => {
  try {
    const bids = await assessorService.getAssessorBids(req.params.assessorId);
    res.status(200).json(bids);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const submitAssessmentReport = async (req, res) => {
  try {
    const claim = await assessorService.submitAssessmentReport(req.params.claimId, req.body.assessmentReport);
    res.status(200).json({ message: 'Assessment report submitted successfully', claim });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

module.exports = {
  login,
  createAssessor,
  getAllAssessors,
  getAssessorById,
  updateAssessor,
  deleteAssessor,
  getApprovedClaims,
  placeBid,
  getAssessorBids,
  submitAssessmentReport,
};
