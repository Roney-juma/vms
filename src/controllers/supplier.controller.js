const Supplier = require('../models/supplier.model')
const Claim = require('../models/claim.model');
const bcrypt = require('bcrypt')
const tokenService = require("../service/token.service");
const emailService = require("../service/email.service");
const supplierService = require("../service/supplier.service");


// create New Supplier
const createSupplier = async (req, res) => {
    try {
      // Create a new Supplier from the request body
      const newSupplier = new Supplier(req.body);
      const password = await bcrypt.hash(newSupplier.password,10)
      newSupplier.password = password
      const supplier = await newSupplier.save();
  
      if (supplier && supplier.email) {
        // Send email notification with login credentials
        emailService.sendEmailNotification(
          supplier.email,
          'Welcome To Ave Insurance',
          `Dear ${supplier.name},
  
  You have successfully been registered to Ave Insurance as a Supplier.
  
  Your login credentials are as follows:
  Username: ${supplier.email}
  Password: ${req.body.password}
  
  Please keep this information secure.
  
  Best Regards,
  Admin Team`
        );
      }
      res.status(201).json(supplier);
    } catch (err) {
      console.error('Error creating Supplier:', err);
      res.status(500).json({ error: 'Server error' });
    }
  };

  const login =
  async (req, res) => {
      const { email, password } = req.body;
      const user = await supplierService.loginUserWithEmailAndPassword(email, password);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
        }
      const tokens = tokenService.GenerateToken(user);
      res.send({ user, tokens });
  };

//   Get all suppliers
const getAllSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find()
        res.status(200).json(suppliers);
        } catch (err) {
            console.error('Error fetching suppliers:', err);
            res.status(500).json({ error: 'Server error' });
            }
};
//   Get a supplier by id
const getSupplierById = async (req, res) => {
    try {
        const supplierId = req.params.id;
        const supplier = await Supplier.findById(supplierId);
        if (!supplier) {
            res.status(404).json({ error: 'Supplier not found' });
            } else {
                res.status(200).json(supplier);
                }
                } catch (err) {
                    console.error('Error fetching supplier:', err);
                    res.status(500).json({ error: 'Server error' });
                    }
};
//   Update a supplier
const updateSupplier = async (req, res) => {
    try {
        const supplierId = req.params.id;
        const supplier = await Supplier.findByIdAndUpdate(supplierId, req.body, { new: true });
        if (!supplier) {
            res.status(404).json({ error: 'Supplier not found' });
            } else {
                res.status(200).json(supplier);
                }
                } catch (err) {
                    console.error('Error updating supplier:', err);
                    res.status(500).json({ error: 'Server error' });
                    }
};
//   Delete a supplier
const deleteSupplier = async (req, res) => {
    try {
        const supplierId = req.params.id;
        await Supplier.findByIdAndDelete(supplierId);
        res.status(200).json({ message: 'Supplier deleted successfully' });
        } catch (err) {
            console.error('Error deleting supplier:', err);
            res.status(500).json({ error: 'Server error' });
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
// Submit Bid to Supply Parts
const submitBidForSupply = async (req, res) => {
    const { claimId } = req.params;
    const { supplierId, parts } = req.body;
    try {
      const claim = await Claim.findById(claimId);
      const totalCost = parts.reduce((acc, part) => acc + part.partCost, 0);
      const supplyBid = new SupplyBid({
        claimId,
        supplierId,
        parts,
        totalCost,
        status: 'Pending'
      });
      await supplyBid.save();
      // Associate the bid with the claim
    claim.supplierBids.push(supplyBid._id);
    await claim.save();
    res.status(201).json({ message: 'Supply bid submitted successfully', supplyBid });
    } catch (error) {
      console.error('Error submitting supply bid:', error);
      res.status(500).json({ message: 'Supply bid not submitted' });
      }
      };
    //   Get my Bid History As a Supplier
    const getMyBidHistory = async (req, res) => {
        const { supplierId } = req.params;
        try {
            const supplierBids = await SupplyBid.find({ supplierId })
            .populate('claimId')
            .populate('supplierId');
            const bidHistory = supplierBids.map((bid) => ({
                claimId: bid.claimId._id,
                claimant: bid.claimId.claimant,
                claimStatus: bid.claimId.status,
                bidId: bid._id,
                bidStatus: bid.status,
                totalCost: bid.totalCost,
                parts: bid.parts
                }));
                res.json(bidHistory);
                } catch (err) {
                    res.status(500).json({ error: 'Server error' });
                    }
        };

// Get All Claims with Status in Garage
const getAllClaimsInGarage = async (req, res) => {
    try {
      // Fetch claims with status 'Garage' and no supplier bids accepted
      const claims = await Claim.find({
        status: 'Garage',
        'supplierBids': {
          $not: { $elemMatch: {status: 'Accepted' } }
        }
      });
  
      res.json(claims);
    } catch (error) {
      console.error('Error fetching claims:', error);
      res.status(500).json({ message: 'Failed to fetch claims' });
    }
  };

  const completeRepair = async (req, res) => {
    try {
      // Find the claim by ID
      const claim = await Claim.findById(req.params.id);
      if (!claim) return res.status(404).json({ error: 'Claim not found' });
  
      // Update the claim status to 'Completed'
      claim.status = 'Completed';
      claim.repairDate = new Date();
      await claim.save();
  
      // Notify the claimant that the repair is complete and an assessor will verify
      if (claim.claimant && claim.claimant.email) {
        emailService.sendEmailNotification(
          claim.claimant.email,
          'Repair Completed - Verification Pending',
          `Dear ${claim.claimant.name},
  
  We are pleased to inform you that the repair for your claim with ID: ${claim._id} has been completed. An assessor will be reaching out to verify the repair details.
  
  Thank you for your patience during this process.
  
  Best Regards,
  Admin Team`
        );
      }
  
      // Notify the assessor to confirm the repair
      if (claim.awardedAssessor && claim.awardedAssessor.assessorId) {
        const assessor = await Assessor.findById(claim.awardedAssessor.assessorId);
        if (assessor && assessor.email) {
          emailService.sendEmailNotification(
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
  
      // Respond with the updated claim object
      res.json(claim);
    } catch (err) {
      console.error('Error completing repair:', err);
      res.status(500).json({ error: 'Server error' });
    }
  };
// Repair Parts Delivered
const repairPartsDelivered = async (req, res) => {
  try {
    const claimId = req.params.claimId;
    const claim = await Claim.findById(claimId);
    // Update the claim.supplierBid status to 'Delivered'
    const bid = claim.supplierBid.find(bid => bid.bidderType === 'supplier' && bid.status === 'Accepted');

    if (!bid) {
      return res.status(404).json({ message: 'No accepted supplier bid found in the claim' });
    }

    // Update the status to 'Delivered'
    bid.status = 'Delivered';
    claim.status = 'Repair';
    claim.repairDate = new Date();
    await claim.save();
  }
  catch (err) {
    console.error('Error delivering repair parts:', err);
    res.status(500).json({ error: 'Server error' });
    }
    };

module.exports = {
    createSupplier,
    getAllSuppliers,
    getSupplierById,
    updateSupplier,
    deleteSupplier,
    submitBidForSupply,
    getMyBidHistory,
    getAllClaimsInGarage,
    repairPartsDelivered,
    login
    };













