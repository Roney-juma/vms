const claimService = require('../service/claim.service');

// Create a new claim
const createClaim = async (req, res) => {
  try {
    const claim = await claimService.createClaim(req.body);
    res.status(201).json(claim);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all claims
const getClaims = async (req, res) => {
  try {
    const claims = await claimService.getClaims();
    res.status(200).json(claims);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get claims by customer ID
const getClaimsByCustomer = async (req, res) => {
  try {
    const claims = await claimService.getClaimsByCustomer(req.params.customerId);
    res.status(200).json(claims);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve a claim
const approveClaim = async (req, res) => {
  try {
    const claim = await claimService.approveClaim(req.params.id);
    res.status(200).json(claim);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a claim
const deleteClaim = async (req, res) => {
  try {
    const claim = await claimService.deleteClaim(req.params.id);
    res.status(200).json({ message: 'Claim deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject a claim
const rejectClaim = async (req, res) => {
  try {
    const claim = await claimService.rejectClaim(req.params.id);
    res.status(200).json(claim);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific claim by ID
const getClaimById = async (req, res) => {
  try {
    const claim = await claimService.getClaimById(req.params.id);
    res.status(200).json(claim);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Award a claim to an assessor
const awardClaim = async (req, res) => {
  try {
    const claim = await claimService.awardClaim(req.params.id, req.body.bidId);
    res.status(200).json(claim);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Award a bid to a garage
const awardBidToGarage = async (req, res) => {
  try {
    const claim = await claimService.awardBidToGarage(req.params.id, req.body.bidId);
    res.status(200).json(claim);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get awarded claims
const getAwardedClaims = async (req, res) => {
  try {
    const claims = await claimService.getAwardedClaims();
    res.status(200).json(claims);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get bids by claim
const getBidsByClaim = async (req, res) => {
  try {
    const bids = await claimService.getBidsByClaim(req.params.id);
    res.status(200).json(bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get garage bids by claim
const getGarageBidsByClaim = async (req, res) => {
  try {
    const bids = await claimService.getGarageBidsByClaim(req.params.id);
    res.status(200).json(bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Garage finds assessed claims for repair
const garageFindsAssessedClaimsForRepair = async (req, res) => {
  try {
    const claims = await claimService.garageFindsAssessedClaimsForRepair();
    res.status(200).json(claims);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get assessed claim by ID
const getAssessedClaimById = async (req, res) => {
  try {
    const claim = await claimService.getAssessedClaimById(req.params.id);
    res.status(200).json(claim);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get assessed claims by garage
const getAssessedClaimsByGarage = async (req, res) => {
  try {
    const claims = await claimService.getAssessedClaimsByGarage(req.params.garageId);
    res.status(200).json(claims);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all supplier bids for a claim
const getSupplierBidsForClaim = async (req, res) => {
  try {
    const bids = await claimService.getSupplierBidsForClaim(req.params.claimId);
    res.status(200).json(bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Accept a supplier bid
const acceptSupplierBid = async (req, res) => {
  try {
    const bid = await claimService.acceptSupplierBid(req.params.claimId, req.params.bidId);
    res.status(200).json(bid);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
