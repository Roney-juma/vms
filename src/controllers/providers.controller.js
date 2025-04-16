const {Provider,Emergency} = require('../models');
const { sendNotification } = require('../service/notification.service');

// Register as service provider
const registerProvider = async (req, res) => {
  try {
    const { serviceType, companyName, contactNumber, coordinates } = req.body;
    console.log("Here we go")
    const userId = req.user.id;
    const existingProvider = await Provider.findOne({ user: userId });
    if (existingProvider) {
      return res.status(400).json({ message: 'Provider already registered' });
    }
    const newProvider = new Provider({
      user: userId || '',
      serviceType,
      companyName,
      contactNumber,
      location:{
        type: 'Point',
        coordinates: coordinates
      }
    });
    await newProvider.save();
    res.status(201).json(newProvider);
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }
}
// Get provider profile
const getProviderProfile = async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user.id }).populate('user');
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    res.json(provider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Update emergency progress
const updateEmergencyProgress = async (req, res) => {
  try {
    const { status, progress } = req.body;
    const emergency = await Emergency.findByIdAndUpdate(
      req.params.id,
      { status, progress },
      { new: true }
    );
    
    // Notify user
    sendNotification(emergency.user, {
      title: 'Emergency Update',
      body: `Your emergency request is now ${status}`,
      data: { emergencyId: emergency._id }
    });
    
    res.json(emergency);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Get all emergencies for a provider
const getProviderEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find({ provider: req.user.id })
      .populate('user')
      .populate('provider');
    res.json(emergencies);
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }
}
// Get nearby emergencies
const getNearbyEmergencies = async (req, res) => {
  try {
    const { longitude, latitude } = req.query;
    const radius = req.provider.serviceRadius || 10000;
    const emergencies = await Emergency.find({
      location: {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], radius / 6378.1]
        }
      },
      status: 'pending'
    }).populate('user');
    
    res.json(emergencies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Get all service providers
const getServiceProviders = async (req, res) => {
  try {
    const providers = await Provider.find().populate('user');
    res.json(providers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
// Get service provider by ID
const getServiceProviderById = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id).populate('user');
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    res.json(provider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Get service providers by service type
const getServiceProvidersByServiceType = async (req, res) => {
  try {
    const { serviceType } = req.query;
    const providers = await Provider.find({ serviceType }).populate('user');
    res.json(providers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
// Get service providers by location
const getServiceProvidersByLocation = async (req, res) => {
  try {
    const { longitude, latitude } = req.query;
    const radius = req.provider.serviceRadius || 10000;
    const providers = await Provider.find({
      location: {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], radius / 6378.1]
        }
      }
    }).populate('user');
    
    res.json(providers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update provider's availability status
const updateProviderStatus = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const provider = await Provider.findOneAndUpdate(
      { user: req.user.id },
      { isAvailable },
      { new: true }
    );
    
    res.json(provider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Accept emergency request
const acceptEmergency = async (req, res) => {
  try {
    const emergency = await Emergency.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'accepted',
        provider: req.user.id,
        acceptedAt: new Date()
      },
      { new: true }
    );
    
    // Notify user
    sendNotification(emergency.user, {
      title: 'Help is on the way!',
      body: 'A service provider has accepted your request',
      data: { emergencyId: emergency._id }
    });
    
    res.json(emergency);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Export all functions
module.exports = {
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
};