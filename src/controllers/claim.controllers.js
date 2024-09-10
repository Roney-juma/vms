const express = require('express');
const router = express.Router();
const Claim = require('../models/claim.model');
const Customer = require('../models/customerModel')
const Assessor = require('../models/assessor.model')
const { ObjectId } = require('mongodb');
const emailService = require("../service/email.service");


const createClaim = async (req, res) => {
  try {
    // Find the customer (claimant) by ID
    const claimant = await Customer.findById(req.body.customerId);
    
    if (!claimant) {
      return res.status(404).send({ error: 'Customer not found' });
    }

    // Construct claimant's full name and contact details
    claimant.name = `${claimant.firstName} ${claimant.lastName}`;
    req.body.claimant = {
      name: claimant.name,
      address: claimant.address, // Assuming these fields exist in the claimant object
      phone: claimant.phone,
      email: claimant.email,
    };

    // Create a new claim
    const claim = new Claim(req.body);
    await claim.save();

    // Send email notification to the customer
    if (claimant.email) {
      emailService.sendEmailNotification(
        claimant.email,
        'Claim Submission Confirmation',
        `Dear ${claimant.name},

Your claim has been successfully submitted and is now being processed. Our team will review your claim and get back to you shortly.

Thank you for choosing Ave Insurance.

Best Regards,
Admin Team`
      );
    }

    // Respond with the newly created claim object
    res.status(201).send(claim);
  } catch (error) {
    console.error('Error creating claim:', error);
    res.status(400).send({ error: 'Server error' });
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
    // Update the claim status to 'Approved'
    const claim = await Claim.findByIdAndUpdate(
      req.params.id,
      { status: 'Approved' },
      { new: true }
    );

    if (!claim) {
      return res.status(404).send('Claim not found');
    }

    // Retrieve the customer information
    const claimant = claim.claimant;

    if (claimant && claimant.email) {
      emailService.sendEmailNotification(
        claimant.email,
        'Claim Approval Notification',
        `Dear ${claimant.name},

We are pleased to inform you that your claim with ID: ${claim._id} has been approved. The compensation will be processed shortly.

Thank you for choosing Ave Insurance.

Best Regards,
Admin Team`
      );
    }
    res.status(200).send(claim);
  } catch (error) {
    console.error('Error approving claim:', error);
    res.status(500).send({ error: 'Server error' });
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
    // Find the claim by ID
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ error: 'Claim not found' });

    // Find the bid within the claim's bids array
    const bid = claim.bids.id(bidId);
    if (!bid || bid.status !== 'pending') {
      return res.status(400).json({ error: 'Invalid bid' });
    }

    // Update the bid status to 'awarded'
    bid.status = 'awarded';
    claim.awardedAssessor = {
      assessorId: bid.assessorId,
      awardedAmount: bid.amount,
      awardedDate: Date.now(),
    };

    await claim.save();

    // Fetch the assessor details
    const assessor = await Assessor.findById(bid.assessorId);
    if (assessor && assessor.email) {
      // Notify the assessor
      emailService.sendEmailNotification(
        assessor.email,
        'Claim Award Notification',
        `Dear ${assessor.name},

Congratulations! You have been awarded the claim with ID: ${claim._id}. You are required to submit a report within 3 days.

Please ensure that the report is submitted on time to facilitate the next steps in the claims process.

Best Regards,
Admin Team`
      );

      // Notify the claimant
      if (claim.claimant && claim.claimant.email) {
        emailService.sendEmailNotification(
          claim.claimant.email,
          'Assessor Visit Notification',
          `Dear ${claim.claimant.name},

We are pleased to inform you that your claim with ID: ${claim._id} has been awarded to an assessor. The assessor, ${assessor.name}, will be visiting to assess the state of your vehicle.

Here are the assessor's contact details:
- Phone: ${assessor.phone}
- Email: ${assessor.email}

Please feel free to reach out to the assessor to coordinate the visit.

Thank you for choosing Ave Insurance.

Best Regards,
Admin Team`
        );
      }
    }

    // Respond with the updated claim object
    res.json(claim);
  } catch (err) {
    console.error('Error awarding claim:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Award Bid to Garage
const awardBidToGarage = async (req, res) => {
  const { bidId } = req.body;

  try {
    // Find the claim by ID
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ error: 'Claim not found' });

    // Find the bid within the claim's bids array
    const bid = claim.bids.id(bidId);
    if (!bid || bid.status !== 'pending') {
      return res.status(400).json({ error: 'Invalid bid' });
    }

    // Update the bid status to 'awarded'
    bid.status = 'awarded';
    claim.awardedGarage = {
      garageId: bid.garageId,
      awardedAmount: bid.amount,
      awardedDate: Date.now(),
    };

    await claim.save();

    // Fetch the garage details
    const garage = await Garage.findById(bid.garageId);
    if (garage && garage.email) {
      // Notify the garage
      emailService.sendEmailNotification(
        garage.email,
        'Bid Award Notification',
        `Dear ${garage.name},

Congratulations! Your bid for the claim with ID: ${claim._id} has been awarded. You are requested to proceed with the repair of the vehicle as soon as possible.

Please ensure that all necessary repairs are completed in a timely and professional manner.

Thank you for your cooperation.

Best Regards,
Admin Team`
      );
    }

    // Respond with the updated claim object
    res.json(claim);
  } catch (err) {
    console.error('Error awarding bid to garage:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

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
const getGarageBidsByClaim = async (req, res) => {
    const claimId = req.params.id;
    
    try {
      const claim = await Claim.findById(claimId);
      if (!claim) {
        return res.status(404).json({ error: 'Claim not found' });
        }
        // Filter bids to include only those with bidderType 'assessor'
      const assessorBids = claim.bids.filter(bid => bid.bidderType === 'garage');
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
    getAssessedClaimsByGarage,
    awardBidToGarage,
    getGarageBidsByClaim
  };
