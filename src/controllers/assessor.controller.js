const Assessor = require('../models/assessor.model');
const Claim = require('../models/claim.model');
const Garage = require('../models/garage.model');
const customerModel = require("../models/customerModel");
const bcrypt = require('bcrypt')
const assessorService = require("../service/assesor.service");
const tokenService = require("../service/token.service");
const emailService = require("../service/email.service");



const login =
    async (req, res) => {
        const { email, password } = req.body;
        const user = await assessorService.loginUserWithEmailAndPassword(email, password);
        const tokens = tokenService.GenerateToken(user);
        res.send({ user, tokens });
    };
// Create new assessor

const createAssessor = async (req, res) => {
  try {
    const assessorData = req.body;
    const plainPassword = assessorData.password;
    const existingGarage = await Garage.findOne({ email: assessorData.email });
    const existingCustomer = await customerModel.findOne({ email: assessorData.email });
    const existingAssessor = await Assessor.findOne({ email: assessorData.email });
    if (existingGarage || existingCustomer || existingAssessor) {
      return res.status(409).json({ message: 'We Already have a user with this Email' });
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    assessorData.password = hashedPassword;

    // Create a new Assessor instance
    const newAssessor = new Assessor(assessorData);

    // Save the new assessor
    const savedAssessor = await newAssessor.save();

    // Send email notification with login credentials
    if (savedAssessor && savedAssessor.email) {
      await emailService.sendEmailNotification(
        savedAssessor.email,
        'Welcome To Ave Insurance',
        `Dear ${savedAssessor.name},

You have successfully been registered to Ave Insurance as an Assessor.

Your login credentials are as follows:
Username: ${savedAssessor.email}
Password: ${plainPassword}

Please keep this information secure.

Best Regards,
Admin Team`
      );
    }
    res.status(201).json(savedAssessor);
  } catch (err) {
    console.error('Error creating assessor:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
  

//   Get all Assessors
const getAllAssessors = async (req, res) => {
    try {
        const assessors = await Assessor.find();
        res.status(200).json(assessors);
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
            }
    };
//   Get Assessor by ID
const getAssessorById = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id); // Optional: for debugging

    // Directly pass the ID string to findById
    const assessor = await Assessor.findById(id);

    if (!assessor) {
      return res.status(404).json({ error: 'Assessor not found' });
    }

    res.status(200).json(assessor);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

      //   Update Assessor
const updateAssessor = async (req, res) => {
    try {
        const id = req.params.id;
        
        const updatedAssessor = await Assessor.findByIdAndUpdate(id, req.body, { new: true });
            res.status(200).json(updatedAssessor);
        } catch (err) {
             res.status(500).json({ error: 'Server error' });
                                        }
             };
//   Delete Assessor
const deleteAssessor = async (req, res) => {
    try {
        const id = req.params.id;
        await Assessor.findByIdAndDelete(id);
        res.status(200).json({ message: 'Assessor deleted successfully' });
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
            }
            };
//   Get Approved Claims
const getApprovedClaims = async (req, res) => {
    try {
      const claims = await Claim.find({ status: 'Approved',awardedAssessor: { $exists: false } });
      res.json(claims);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
    };
  
    const placeBid = async (req, res) => {
      const { assessorId, amount } = req.body;
    
      try {
        // Find the claim by ID
        const claim = await Claim.findById(req.params.id);
        if (!claim) return res.status(404).json({ error: 'Claim not found' });
    
        // Check if the claim is approved for bidding
        if (claim.status !== 'Approved') {
          return res.status(400).json({ error: 'Bids can only be placed on approved claims' });
        }
    
        // Check if the assessor has already placed a bid on this claim
        const existingBid = claim.bids.find(bid => bid.assessorId.toString() === assessorId);
        if (existingBid) {
          return res.status(400).json({ error: 'You have already placed a bid on this claim' });
        }
    
        // Create a new bid
        const newBid = {
          bidderType: 'assessor',
          assessorId,
          amount,
          bidDate: new Date(),
          status: 'pending',
        };
    
        // Add the new bid to the claim
        claim.bids.push(newBid);
        await claim.save();
    
        // Find the assessor and send email notification
        const assessor = await Assessor.findById(assessorId);
        if (assessor && assessor.email) {
          await emailService.sendEmailNotification(
            assessor.email,
            'New Bid Placed',
            `Dear ${assessor.name},\n\nYou have successfully placed a bid of ${amount} on claim ID: ${claim._id}.`
          );
        }
    
        // Respond with the updated claim object
        res.status(201).json(claim);
      } catch (err) {
        console.error('Error placing bid:', err);
        res.status(500).json({ error: 'Server error' });
      }
    };
    
//   Get Assessor Bids
const getAssessorBids = async (req, res) => {
  const { assessorId } = req.params;

  try {
    // Find all claims that have at least one bid placed by the specified assessor
    const claims = await Claim.find({ "bids.assessorId": assessorId });

    // Extract and collect only the bids placed by the specified assessor
    const assessorBids = [];
    for (const claim of claims) {
      const relevantBids = claim.bids.filter(
        (bid) => bid.assessorId && bid.assessorId.toString() === assessorId
      );

      // Add relevant bids to the assessorBids array
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

    if (assessorBids.length === 0) {
      return res.status(404).json({ error: 'No bids found for this assessor' });
    }

    res.json(assessorBids);
  } catch (err) {
    console.error('Error fetching assessor bids:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


// Submit Assessment Report
const submitAssessmentReport = async (req, res) => {
  const { claimId } = req.params;
  const { assessmentReport } = req.body;
  try {
    const claim = await Claim.findById(claimId);
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
      }
      claim.assessmentReport = assessmentReport;
      claim.status = 'Assessed';
      await claim.save();
      res.json({ message: 'Assessment report submitted successfully',claim:claim });
      } catch (err) {
        res.status(500).json({ error: 'Report Not submitted' });
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
    submitAssessmentReport
    };