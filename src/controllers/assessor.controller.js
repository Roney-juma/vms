const Assessor = require('../models/assessor.model');
const Claim = require('../models/claim.model');

const assessorService = require("../service/assesor.service");
const tokenService = require("../service/token.service");


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
        // const { name, contactInfo, licenseNumber, experience, specialties } = req.body;
        const newAssessor =new Assessor(req.body);
        const assessor = await newAssessor.save();
        
            res.status(201).json(assessor);
            } catch (err) {
                res.status(500).json({ error: err });
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
      const claim = await Claim.findById(req.params.id);
      if (!claim) return res.status(404).json({ error: 'Claim not found' });
  
      if (claim.status !== 'Approved') {
        return res.status(400).json({ error: 'Bids can only be placed on approved claims' });
      }
  
      const newBid = {
        bidderType: 'assessor', 
        assessorId,
        amount,
        bidDate: new Date(), 
        status: 'pending',
      };
  
      claim.bids.push(newBid);
      await claim.save();
  
      res.status(201).json(claim);
    } catch (err) {
      res.status(500).json({ error: err });
    }
};
//   Get Assessor Bids
const getAssessorBids = async (req, res) => {
  const { assessorId } = req.params;

  try {
    // Find all claims that have bids placed by the specified assessor
    const claims = await Claim.find({ "bids.assessorId": assessorId });

    // Extract and collect only the bids placed by the specified assessor
    const assessorBids = [];
    claims.forEach(claim => {
      claim.bids.forEach(bid => {
        if (bid.assessorId.toString() === assessorId) {
          assessorBids.push({
            claimId: claim._id,
            bidId: bid._id,
            amount: bid.amount,
            status: bid.status,
            bidDate: bid.bidDate,
            claimStatus: claim.status
          });
        }
      });
    });

    if (assessorBids.length === 0) {
      return res.status(404).json({ error: 'No bids found for this assessor' });
    }

    res.json(assessorBids);
  } catch (err) {
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