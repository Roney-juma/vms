const Garage = require('../models/garage.model');
const Claim = require('../models/claim.model');
const { ObjectId } = require('mongodb');

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
      const newGarage = new Garage(req.body);
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
  //   Exporting the routes
module.exports = {
    createGarage,
    login,
    getAllGarages,
    getGarage,
    updateGarage,
    deleteGarage,
    getAssessedClaims
    };



