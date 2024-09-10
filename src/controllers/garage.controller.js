const Garage = require('../models/garage.model');
const Claim = require('../models/claim.model');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt')
const garageService = require("../service/garage.service.js");
const tokenService = require("../service/token.service");


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

const createGarage = async (req, res) => {
    try {
      const garage = req.body
      const password = await bcrypt.hash(garage.password,10)
      garage.password = password
      const newGarage = new Garage(garage);
      const savedGarage = await newGarage.save();
      res.status(201).json(savedGarage);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
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
      const claims = await Claim.find({ status: 'Assessed',assessmentReport: { $exists: true } });
      res.json(claims);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
    };

    const placeBid = async (req, res) => {
      const { garageId, amount } = req.body;
    
      try {
        const claim = await Claim.findById(req.params.id);
        if (!claim) return res.status(404).json({ error: 'Claim not found' });
    
        if (claim.status !== 'Assessed') {
          return res.status(400).json({ error: 'Bids can only be placed on Assessed claims' });
        }
    
        const newBid = {
          bidderType: 'garage', 
          garageId,
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
  // Complete Repair
  const completeRepair = async (req, res) => {
    try {
      const claim = await Claim.findById(req.params.id);
      if (!claim) return res.status(404).json({ error: 'Claim not found'
      });
        claim.status = 'Completed';
        claim.repairDate = new Date();
        await claim.save();
        res.json(claim);
        } catch (err) {
          res.status(500).json({ error: 'Server error' });
          }
          };

const getGarageBids = async (req, res) => {
            const { garageId } = req.params;
          
            try {
              // Find all claims that have bids placed by the specified assessor
              const claims = await Claim.find({ "bids.garageId": garageId });
          
              // Extract and collect only the bids placed by the specified assessor
              const garageBids = [];
              claims.forEach(claim => {
                claim.bids.forEach(bid => {
                  if (bid.garageId.toString() === garageId) {
                    garageBids.push({
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
          
              if (garageBids.length === 0) {
                return res.status(404).json({ error: 'No bids found for this assessor' });
              }
          
              res.json(garageBids);
            } catch (err) {
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



