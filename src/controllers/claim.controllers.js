const express = require('express');
const router = express.Router();
const Claim = require('../models/claim.model');
const Customer = require('../models/customerModel')
const { ObjectId } = require('mongodb');


const createClaim = async (req, res) => {
    try {
      claimant = await Customer.findById(req.body.customerId)
      claimant.name = `${claimant.firstName} ${claimant.lastName}`
      req.body.claimant = {
        name: claimant.name,
        address: claimant.address, // Assuming these fields exist in the claimant object
        phone: claimant.phone,
        email: claimant.email
      };
      const claim = new Claim(req.body);
      await claim.save();
      res.status(201).send(claim);
    } catch (error) {
      res.status(400).send(error);
    }
  };

// Get all claims
const getClaims = async (req, res) => {
  try {
    const claims = await Claim.find();
    res.status(200).json(claims);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Get all claims for specific customer
const getClaimsByCustomer = async (req, res) => {
  const customerId = req.params.customerId;

  try {
    const claims = await Claim.find({ customerId: customerId }).populate('customerId');
    res.status(200).json(claims);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Approve a claim
 const approveClaim = async (req, res) => {
  try {
    const claim = await Claim.findByIdAndUpdate(
      req.params.id,
      { status: 'Approved' },
      { new: true }
    );
    if (!claim) {
      return res.status(404).send('Claim not found');
    }
    res.status(200).send(claim);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Delete a claim
const deleteClaim = async (req, res) => {
  try {
    const claim = await Claim.findByIdAndDelete(req.params.id);
    if (!claim) {
      return res.status(404).send('Claim not found');
    }
    res.status(200).send('Claim deleted');
  } catch (error) {
    res.status(500).send(error);
  }
};

// Reject a claim
const rejectClaim = async (req, res) => {
  try {
    const claim = await Claim.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    if (!claim) {
      return res.status(404).send('Claim not found');
    }
    res.status(200).send(claim);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Get a specific claim
const getClaimById = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).send('Claim not found');
    }
    res.status(200).json(claim);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Award Bid to Assessor
const awardClaim = async (req, res) => {
  const { bidId } = req.body;

  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ error: 'Claim not found' });

    const bid = claim.bids.id(bidId);
    if (!bid || bid.status !== 'pending') {
      return res.status(400).json({ error: 'Invalid bid' });
    }

    bid.status = 'awarded';
    claim.awardedAssessor = {
      assessorId: bid.assessorId,
      awardedAmount: bid.amount,
      awardedDate: Date.now()
    };

    await claim.save();

    res.json(claim);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}
// getAwardedClaims
const getAwardedClaims = async (req, res) => {
  try {
    
    const claims = await Claim.find({ awardedAssessor: { $exists: true } });
    res.json(claims);
    } catch (error) {
      res.status(500).send(error);
      }
      };

// getBidsByClaim
const getBidsByClaim = async (req, res) => {
  const claimId = req.params.id;
  
  try {
    const claim = await Claim.findById(claimId);
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
      }
      // Filter bids to include only those with bidderType 'assessor'
    const assessorBids = claim.bids.filter(bid => bid.bidderType === 'assessor');
      res.json(assessorBids);
      } catch (err) {
        res.status(500).json({ error: 'Server error' });
        }
  };

  // Garage Finds Assessed Claims for Repair
  const garageFindsAssessedClaimsForRepair = async (req, res) => {
    try {
      const claims = await Claim.find({ status: 'Assessed' });
      res.status(200).json(claims);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  // getAssessedClaimById
  const getAssessedClaimById = async (req, res) => {
    const claimId = req.params.id;
    try {
      const claim = await Claim.findById(claimId);
      if (!claim) {
        return res.status(404).json({ error: 'Claim not found' });
        }
        res.json(claim);
        } catch (error) {
          res.status(500).json({ error: 'Server error' });
          }
          };
          // getAssessedClaimsByGarage
  const getAssessedClaimsByGarage = async (req, res) => {
        const garageId = req.params.id;
          try {
            const claims = await Claim.find({ garage: garageId, status: 'Assessed' });
            res.json(claims);
            } catch (error) {
              res.status(500).json({ error: 'Server error' });
              }
            };
  // 


module.exports = {
    createClaim,
    getClaims,
    approveClaim,
    deleteClaim,
    rejectClaim,
    getClaimById,
    getClaimsByCustomer,
    awardClaim,
    getBidsByClaim,
    getAwardedClaims,
    garageFindsAssessedClaimsForRepair,
    getAssessedClaimById,
    getAssessedClaimsByGarage
  };
