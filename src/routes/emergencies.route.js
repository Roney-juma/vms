const express = require('express');
const router = express.Router();
const {
  createEmergency,
  getAllEmergencies,
  getEmergency,
  updateEmergencyStatus,
  getNearbyProviders,
  dispatchEmergency,
  acceptEmergency,
  getServiceProvidersByServiceType,
  getServiceProvidersByLocation,
  getNearbyEmergencies,
  getAllUserEmergencies,
} = require('../controllers/emergencies.controller');
const verifyToken = require("../middlewheres/verifyToken");

router.use(verifyToken())


// Create emergency request
router.post('/', createEmergency);
// Get all emergencies
router.get('/admin', getAllEmergencies);

// Get emergency details
router.get('/:id', getEmergency);

// Update emergency status
router.put('/:id/status', updateEmergencyStatus);

// Get nearby providers (for testing)
router.get('/:id/nearby', getNearbyProviders);

// Dispatch emergency to providers
router.post('/:id/dispatch', dispatchEmergency);
// Accept emergency request
router.post('/:id/accept', acceptEmergency);
// Get service providers by service type
router.get('/service-type/:type', getServiceProvidersByServiceType);
// Get service providers by location
router.get('/location', getServiceProvidersByLocation);
// Get nearby emergencies
router.get('/nearby', getNearbyEmergencies);
// Get all user emergencies
router.get('/user/history/:id', getAllUserEmergencies);

module.exports = router;