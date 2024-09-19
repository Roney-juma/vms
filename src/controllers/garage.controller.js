const Garage = require('../models/garage.model');
const Claim = require('../models/claim.model');
const Assessor = require('../models/assessor.model.js');
const customerModel = require("../models/customerModel");
const bcrypt = require('bcrypt')
const garageService = require("../service/garage.service.js");
const tokenService = require("../service/token.service");
const emailService = require("../service/email.service");

const createGarage = async (req, res) => {
  try {
    // Extract garage data from the request body
    const garage = req.body;
    const plainPassword = garage.password;

    const existingGarage = await Garage.findOne({ email: garage.email });
    const existingCustomer = await customerModel.findOne({ email: garage.email });
    const existingAssessor = await Assessor.findOne({ email: garage.email });
    if (existingGarage || existingCustomer || existingAssessor) {
      return res.status(409).json({ message: 'We Already have a user with this Email' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    garage.password = hashedPassword;

    // Create a new Garage instance
    const newGarage = new Garage(garage);

    // Save the new garage
    const savedGarage = await newGarage.save();

    // Send email notification to the garage with their new account details
    if (savedGarage && savedGarage.email) {
      await emailService.sendEmailNotification(
        savedGarage.email,
        'Welcome to Ave Insurance - Your New Account Details',
        `Dear ${savedGarage.name},

We are delighted to welcome you to Ave Insurance! Your new account has been successfully created.

Here are your account details:

- Name: ${savedGarage.name}
- Email: ${savedGarage.email}
- Password: ${plainPassword}

You can log in to your account using your registered email address. Please contact us if you have any questions or need further assistance.

Thank you for choosing Ave Insurance.

Best Regards,
Admin Team`
      );
    }
    res.status(201).json(savedGarage); 
  } catch (error) {
    console.error('Error creating garage:', error);
    res.status(500).json({ message: error.message }); 
  }
};



const login =
    async (req, res) => {
        const { email, password } = req.body;
        const user = await garageService.loginUserWithEmailAndPassword(email, password);
        
        if (!user) {
          return res.status(401).json({ message: "Invalid email or password" });
          }
        const tokens = tokenService.GenerateToken(user);
        res.send({ user, tokens });
    };
    

//   Get All Garages
const getAllGarages = async (req, res) => {
    try {
      const garages = await Garage.find();
      res.status(200).json(garages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

//   Get a Specific Garage
const getGarage = async (req, res) => {
    try {
      const garage = await Garage.findById(req.params.garageId);
      if (!garage) return res.status(404).json({ message: 'Garage not found' });
      res.status(200).json(garage);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

//   Update a Garage
const updateGarage = async (req, res) => {
    try {
      const updatedGarage = await Garage.findByIdAndUpdate(req.params.garageId, req.body, { new: true });
      if (!updatedGarage) return res.status(404).json({ message: 'Garage not found' });
      res.status(200).json(updatedGarage);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  //   Delete a Garage
const deleteGarage = async (req, res) => {
    try {
      const deletedGarage = await Garage.findByIdAndDelete(req.params.garageId);
      if (!deletedGarage) return res.status(404).json({ message: 'Garage not found' });
      res.status(200).json({ message: 'Garage deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const getAssessedClaims = async (req, res) => {
    try {
      const claims = await Claim.find({ status: 'Assessed',awardedGarage: { $exists: false } });
      res.json(claims);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
    };

    const placeBid = async (req, res) => {
      const { garageId, amount } = req.body;
    
      try {
        // Find the claim by ID
        const claim = await Claim.findById(req.params.id);
        if (!claim) return res.status(404).json({ error: 'Claim not found' });
    
        // Check if the claim is in 'Assessed' status
        if (claim.status !== 'Assessed') {
          return res.status(400).json({ error: 'Bids can only be placed on Assessed claims' });
        }
    
        // Check if the garage has already placed a bid on this claim
        const existingBid = claim.bids.find(bid => bid.garageId && bid.garageId.toString() === garageId);
        if (existingBid) {
          return res.status(400).json({ error: 'You have already placed a bid on this claim' });
        }
    
        // Create a new bid
        const newBid = {
          bidderType: 'garage',
          garageId,
          amount,
          bidDate: new Date(),
          status: 'pending',
        };
    
        // Add the new bid to the claim
        claim.bids.push(newBid);
        await claim.save();
    
        // Find the garage and send email notification
        const garage = await Garage.findById(garageId); // Assuming 'Garage' is the model for garages
        if (garage && garage.email) {
          await emailService.sendEmailNotification(
            garage.email,
            'New Bid Placed',
            `Dear ${garage.name},\n\nYou have successfully placed a bid of ${amount} on claim ID: ${claim._id}.`
          );
        }
    
        // Respond with the updated claim object
        res.status(201).json(claim);
      } catch (err) {
        console.error('Error placing bid:', err);
        res.status(500).json({ error: 'Server error' });
      }
    };
    

  // Complete Repair
  const completeRepair = async (req, res) => {
    try {
      // Find the claim by ID
      const claim = await Claim.findById(req.params.id);
      if (!claim) return res.status(404).json({ error: 'Claim not found' });
  
      // Only update the status if the current status is 'Repair'
      if (claim.status !== 'Repair') {
        return res.status(400).json({ error: 'Claim must be in Repair  to mark it as Completed' });
      }
  
      // Update the claim status to 'Completed' and set the repair date
      claim.status = 'Completed';
      claim.repairDate = new Date();
      await claim.save();
  
      // Notify the claimant that the repair is complete and an assessor will verify
      if (claim.claimant && claim.claimant.email) {
        await emailService.sendEmailNotification(
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
          await emailService.sendEmailNotification(
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

  const getGarageBids = async (req, res) => {
    const { garageId } = req.params; // The garage ID to filter bids by
  
    try {
      // Find all claims that contain bids placed by any garage
      const claims = await Claim.find({ 'bids.bidderType': 'garage' });
      console.log("Claims",claims)
      const garageBids = [];
  
      // Loop through each claim and filter the bids array
      claims.forEach(claim => {
        // Filter only the bids that belong to the specified garage
        const filteredBids = claim.bids.filter(bid => 
          bid.bidderType === 'garage' && bid.garageId.toString() === garageId
        );
  
        // Push the relevant information from the filtered bids to the result array
        filteredBids.forEach(bid => {
          garageBids.push({
            claimId: claim._id,
            bidId: bid._id,
            amount: bid.amount,
            status: bid.status,
            bidDate: bid.bidDate,
            claimStatus: claim.status,
            vehicleType: claim.vehiclesInvolved[0]
          });
        });
      });
  
      if (garageBids.length === 0) {
        return res.status(404).json({ error: 'No bids found for this Garage' });
      }
  
      res.json(garageBids);
    } catch (err) {
      console.error('Error fetching garage bids:', err);
      res.status(500).json({ error: 'Server error' });
    }
  };
  


  //   Exporting the routes
module.exports = {
    createGarage,
    login,
    getAllGarages,
    getGarage,
    updateGarage,
    deleteGarage,
    getAssessedClaims,
    placeBid,
    completeRepair,
    getGarageBids
    };



