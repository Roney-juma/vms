const Claim = require('../models/claim.model');
const Customer = require('../models/customerModel');
const Assessor = require('../models/assessor.model');
const Garage = require('../models/garage.model');
const SupplyBid = require('../models/supplyBids.model');
const Notification = require('../models/notification.model');
const emailService = require('./email.service');
const ClaimToken = require('../models/claimToken.model');
const crypto = require('crypto');

const generateClaimLink = async (email) => {
  try {
    const customer = await Customer.findOne({ email });

    if (!customer) {
      return { error: 'Customer not found' };
    }
    const token = crypto.randomBytes(20).toString('hex');
    const customerId = customer._id;


    const claimToken = new ClaimToken({
      customerId,
      token,
    });

    await claimToken.save();

    const claimLink = `http://admin.aveafricasolutions.com/file-claim/${token}`;
    await emailService.sendEmailNotification(
      email,
      'File a claim here',
      `Dear ${customer.firstName},\n\nClick this link to file a claim: ${claimLink}\n\nThank you for choosing Ave Insurance.\n\nBest Regards,\nAdmin Team`
    );
    return claimLink;
  } catch (error) {
    console.error(error);
    return { error: 'Failed to generate claim link' };
  }
};


// File the claim for Web

const fileClaimService = async (token, claimDetails) => {
  try {
    const claimToken = await ClaimToken.findOne({ token });

    if (!claimToken) {
      throw new Error('Invalid token');
    }
    if (claimToken.used) {
      throw new Error('This link has already been used');
    }
    claimToken.used = true;
    await claimToken.save();
    const customer = await Customer.findById(claimToken.customerId);

    if (!customer) {
      throw new Error('Customer not found');
    }
    const newClaim = new Claim({
      customerId: customer._id,
      claimant: {
        name: `${customer.firstName} ${customer.lastName}`,
        address: customer.address || 'Not Provided',
        phone: customer.phone,
        email: customer.email
      },
      ...claimDetails,
    });
    await newClaim.save();
    if (newClaim.claimant.email) {
      await emailService.sendEmailNotification(
        newClaim.claimant.email,
        'Claim Submission Confirmation',
        `Dear ${newClaim.claimant.name},\n\nYour claim has been successfully submitted and is now being processed. Our team will review your claim and get back to you shortly.\n\nThank you for choosing Ave Insurance.\n\nBest Regards,\nAdmin Team`
      );
    }

    return newClaim;

  } catch (error) {
    throw new Error(error.message);
  }
};




// Create a new claim
const createClaim = async (data) => {
  try {
    const claimant = await Customer.findById(data.customerId);
    if (!claimant) {
      throw new Error('Customer not found');
    }
    claimant.name = `${claimant.firstName} ${claimant.lastName}`;
    data.claimant = {
      name: claimant.name,
      address: claimant.address,
      phone: claimant.phone,
      email: claimant.email,
    };
    const claim = new Claim(data);
    await claim.save();
    if (claimant.email) {
      await emailService.sendEmailNotification(
        claimant.email,
        'Claim Submission Confirmation',
        `Dear ${claimant.name},\n\nYour claim has been successfully submitted and is now being processed. Our team will review your claim and get back to you shortly.\n\nThank you for choosing Ave Insurance.\n\nBest Regards,\nAdmin Team`
      );
    }
    return claim;
  } catch (error) {
    throw new Error('Server error');
  }
};

// Get all claims
// Get all claims
const getClaims = async () => {
  return await Claim.find().sort({ createdAt: -1 });
};


// Get claims by customer ID
const getClaimsByCustomer = async (customerId) => {
  return await Claim.find({ customerId: customerId }).populate('customerId');
};

// Approve a claim
const approveClaim = async (id) => {
  const claim = await Claim.findByIdAndUpdate(id, { status: 'Approved' }, { new: true });
  if (!claim) {
    throw new Error('Claim not found');
  }
  const claimant = claim.claimant;
  if (claimant && claimant.email) {
    await emailService.sendEmailNotification(
      claimant.email,
      'Claim Approval Notification',
      `Dear ${claimant.name},\n\nWe are pleased to inform you that your claim with ID: ${claim._id} has been approved. The compensation will be processed shortly.\n\nThank you for choosing Ave Insurance.\n\nBest Regards,\nAdmin Team`
    );
  }
  return claim;
};

// Delete a claim
const deleteClaim = async (id) => {
  return await Claim.findByIdAndDelete(id);
};

// Reject a claim
const rejectClaim = async (id) => {
  const claim = await Claim.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });
  if (!claim) {
    throw new Error('Claim not found');
  }
  return claim;
};

// Get a specific claim by ID
const getClaimById = async (id) => {
  const claim = await Claim.findById(id)
    // .populate('bids.assessorId')
    .populate({ path: 'bids.assessorId', select: 'name email phone _id' })
    .populate({ path: 'bids.garageId', select: 'name email phone _id' });

  if (!claim) {
    throw new Error('Claim not found');
  }
  return claim;
};

// Award Bid to Assessor
const awardClaim = async (id, bidId) => {
  const claim = await Claim.findById(id);
  if (!claim) throw new Error('Claim not found');
  const bid = claim.bids.id(bidId);
  if (!bid || bid.status !== 'pending') throw new Error('Invalid bid');

  bid.status = 'awarded';
  // Mark claim status as Assessment
  claim.status = 'Assessment';
  claim.awardedAssessor = {
    assessorId: bid.assessorId,
    awardedAmount: bid.amount,
    awardedDate: Date.now(),
  };
  claim.bids.forEach(otherBid => {
    if (otherBid._id.toString() !== bidId && otherBid.bidderType === 'assessor') {
      otherBid.status = 'rejected';
    }
  });

  await Notification.create({
    recipientId: bid.assessorId,
    recipientType: 'assessor',
    content: `Your bid for claim ID: ${claim._id} has been awarded.`
  });

  await claim.save();

  const assessor = await Assessor.findById(bid.assessorId);
  if (assessor && assessor.email) {
    await emailService.sendEmailNotification(
      assessor.email,
      'Claim Award Notification',
      `Dear ${assessor.name},\n\nCongratulations! You have been awarded the claim with ID: ${claim._id}. You are required to submit a report within 3 days.\n\nPlease ensure that the report is submitted on time to facilitate the next steps in the claims process.\n\nBest Regards,\nAdmin Team`
    );
    if (claim.claimant && claim.claimant.email) {
      await emailService.sendEmailNotification(
        claim.claimant.email,
        'Assessor Visit Notification',
        `Dear ${claim.claimant.name},\n\nWe are pleased to inform you that your claim with ID: ${claim._id} has been awarded to an assessor. The assessor, ${assessor.name}, will be visiting to assess the state of your vehicle.\n\nHere are the assessor's contact details:\n- Phone: ${assessor.phone}\n- Email: ${assessor.email}\n\nPlease feel free to reach out to the assessor to coordinate the visit.\n\nThank you for choosing Ave Insurance.\n\nBest Regards,\nAdmin Team`
      );
    }
  }
  return claim;
};

// Award Bid to Garage
const awardBidToGarage = async (id, bidId) => {
  const claim = await Claim.findById(id);
  if (!claim) throw new Error('Claim not found');

  const bid = claim.bids.id(bidId);
  if (!bid || bid.status !== 'pending') throw new Error('Invalid bid');
  bid.status = 'awarded';
  claim.awardedGarage = {
    garageId: bid.garageId,
    awardedAmount: bid.totalCost,
    awardedDate: Date.now(),
  };
  claim.status = 'Garage';
  claim.bids.forEach((otherBid) => {
    if (otherBid._id.toString() !== bidId && otherBid.bidderType === 'garage') {
      otherBid.status = 'rejected';
    }
  });

  const garage = await Garage.findById(bid.garageId);
  if (!garage) throw new Error('Garage not found');

  garage.pendingWork = (garage.pendingWork || 0) + 1;
  await garage.save();
  await Notification.create({
    recipientId: bid.garageId,
    recipientType: 'garage',
    content: `Your bid for claim ID: ${claim._id} has been awarded.`,
  });

  await claim.save();
  if (garage.email) {
    await emailService.sendEmailNotification(
      garage.email,
      'Bid Award Notification',
      `Dear ${garage.name},\n\nCongratulations! Your bid for the claim with ID: ${claim._id} has been awarded. You are requested to proceed with the repair of the vehicle as soon as possible.\n\nPlease ensure that all necessary repairs are completed in a timely and professional manner.\n\nThank you for your cooperation.\n\nBest Regards,\nAdmin Team`
    );
  }

  return claim;
};



// Get awarded claims
const getAwardedClaims = async () => {
  return await Claim.find({ awardedAssessor: { $exists: true } });
};

// Get bids by claim
const getBidsByClaim = async (id) => {
  const claim = await Claim.findById(id);
  if (!claim) throw new Error('Claim not found');
  return claim.bids.filter(bid => bid.bidderType === 'assessor');
};

// Get garage bids by claim
const getGarageBidsByClaim = async (id) => {
  const claim = await Claim.findById(id);
  if (!claim) throw new Error('Claim not found');
  return claim.bids.filter(bid => bid.bidderType === 'garage');
};

// Garage finds assessed claims for repair
const garageFindsAssessedClaimsForRepair = async () => {
  return await Claim.find({ status: 'Assessed' });
};

// Get assessed claim by ID
const getAssessedClaimById = async (id) => {
  const claim = await Claim.findById(id);
  if (!claim) throw new Error('Claim not found');
  return claim;
};

// Get assessed claims by garage
const getAssessedClaimsByGarage = async (garageId) => {
  return await Claim.find({ garage: garageId, status: 'Assessed' });
};

// Get all supplier bids for a claim
const getSupplierBidsForClaim = async (claimId) => {
  const claim = await Claim.findById(claimId).populate('supplierBids');
  if (!claim) throw new Error('Claim not found');
  return claim.supplierBids;
};

// Accept a supplier bid
const acceptSupplierBid = async (claimId, bidId) => {
  const supplyBid = await SupplyBid.findById(bidId);
  if (!supplyBid) throw new Error('Supply bid not found');

  supplyBid.status = 'Accepted';
  await supplyBid.save();

  await SupplyBid.updateMany(
    { _id: { $ne: bidId }, claimId: claimId },
    { $set: { status: 'Rejected' } }
  );

  const claim = await Claim.findById(claimId);
  claim.status = 'Repair';
  await claim.save();

  return supplyBid;
};

module.exports = {
  generateClaimLink,
  fileClaimService,
  createClaim,
  getClaims,
  getClaimsByCustomer,
  approveClaim,
  deleteClaim,
  rejectClaim,
  getClaimById,
  awardClaim,
  awardBidToGarage,
  getAwardedClaims,
  getBidsByClaim,
  getGarageBidsByClaim,
  garageFindsAssessedClaimsForRepair,
  getAssessedClaimById,
  getAssessedClaimsByGarage,
  getSupplierBidsForClaim,
  acceptSupplierBid,
};
