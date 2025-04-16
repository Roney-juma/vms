const express = require('express');
const router = express.Router();
const {
  registerProvider,
  updateProviderStatus,
  getProviderProfile,
  acceptEmergency,
  updateEmergencyProgress,
  getNearbyEmergencies,
  getServiceProviders,
  getServiceProviderById,
  getServiceProvidersByServiceType,
  getServiceProvidersByLocation,
  getProviderEmergencies
} = require('../controllers/providers.controller');
const verifyToken = require("../middlewheres/verifyToken");

router.use(verifyToken())


// Register as service provider
router.post('/register', registerProvider);

// Update provider availability status
router.put('/status', updateProviderStatus);

// Get provider profile
router.get('/profile', getProviderProfile);

// Accept emergency request
router.post('/emergencies/:id/accept', acceptEmergency);

// Update emergency progress
router.put('/emergencies/:id/progress', updateEmergencyProgress);
// Get nearby emergencies
router.get('/emergencies/nearby', getNearbyEmergencies);
// Get all service providers
router.get('/', getServiceProviders);
// Get service provider by ID
router.get('/:id', getServiceProviderById);
// Get service providers by service type
router.get('/service-type/:type', getServiceProvidersByServiceType);
// Get service providers by location
router.get('/location', getServiceProvidersByLocation);
// Get provider emergencies
router.get('/emergencies', getProviderEmergencies);


module.exports = router;