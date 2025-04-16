const express = require('express');
const router = express.Router();
const {
  discoverServices,
  getServiceDetails,
  searchServices,
  getFuelStations,
  requestMobileFuel
} = require('../controllers/services.controller');
const verifyToken = require("../middlewheres/verifyToken");

router.use(verifyToken())


// Discover nearby services
router.get('/discover', discoverServices);

// Search services by name/type
router.get('/search', searchServices);
// Get service provider details
router.get('/:providerId', getServiceDetails);

// Get nearby fuel stations
router.get('/fuel/stations', getFuelStations);

// Request mobile fuel delivery
router.post('/fuel/request', requestMobileFuel);

module.exports = router;