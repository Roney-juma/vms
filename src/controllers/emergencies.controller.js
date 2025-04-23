const {User,Emergency,Provider} = require('../models');
const { sendNotification } = require('../service/notification.service');
const { calculateDistance } = require('../utils/geo');

// Create new emergency request
const createEmergency = async (req, res) => {
  try {
    const { type, coordinates, description, serviceSubType, vehicleType } = req.body;
    const userId = req.user?.id;

    // Basic validation
    if (!type || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({ error: 'Invalid or missing type or coordinates' });
    }

    const emergency = new Emergency({
      user: userId,
      type,
      serviceSubType,
      vehicleType,
      location: {
        type: 'Point',
        coordinates
      },
      description,
      status: 'pending'
    });

    await emergency.save();

    // Find nearby providers
    const providers = await findNearbyProviders(coordinates, type);

    // Notify providers if any
    if (providers.length > 0) {
      providers.forEach(provider => {
        sendNotification(provider.user, {
          title: 'New Emergency Request',
          body: `Type: ${type}`,
          data: { emergencyId: emergency._id }
        });
      });
    }

    res.status(201).json({
      message: 'Emergency created successfully',
      emergency,
      notifiedProviders: providers.map(p => p._id)
    });
  } catch (err) {
    console.error('Emergency creation failed:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

// Get emergency details
const getEmergency = async (req, res) => {
  try {
    const emergencyId = req.params.id;
    const emergency = await Emergency.findById(emergencyId).populate('user');
    if (!emergency) {
      return res.status(404).json({ message: 'Emergency not found' });
    }
    res.json(emergency);
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }
}
// Get all emergencies
const getAllEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find().populate('user');
    res.json(emergencies);
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }
}
// Update emergency status
const updateEmergencyStatus = async (req, res) => {
  try {
    const emergencyId = req.params.id;
    const { status } = req.body;
    const emergency = await Emergency.findByIdAndUpdate(emergencyId, { status }, { new: true });
    if (!emergency) {
      return res.status(404).json({ message: 'Emergency not found' });
    }
    // Notify user
    sendNotification(emergency.user, {
      title: 'Emergency Update',
      body: `Your emergency request is now ${status}`,
      data: { emergencyId }
    });
    res.json(emergency);
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }
}
// Dispatch emergency to providers
const dispatchEmergency = async (req, res) => {
  try {
    const emergencyId = req.params.id;
    const { providerId } = req.body;
    
    const emergency = await Emergency.findByIdAndUpdate(emergencyId, { provider: providerId }, { new: true });
    if (!emergency) {
      return res.status(404).json({ message: 'Emergency not found' });
    }
    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    // Update provider status
    provider.isAvailable = false;
    await provider.save();
    // Notify user
    sendNotification(emergency.user, {
      title: 'Emergency Assigned',
      body: `Your emergency request has been assigned to a provider.`,
      data: { emergencyId }
    }
    );
    res.json(emergency);
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }
}
// Get nearby providers (for testing)
const getNearbyProviders = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) {
      return res.status(404).json({ message: 'Emergency not found' });
    }
    const { coordinates } = emergency.location;
    const serviceType = emergency.type;
    // const parsedCoordinates = JSON.parse(coordinates);
    const providers = await findNearbyProviders(coordinates, serviceType);
    res.json(providers);
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }
}
// Accept emergency request
const acceptEmergency = async (req, res) => {
  try {
    const emergencyId = req.params.id;
    const providerId = req.user.id;
    const emergency = await Emergency.findByIdAndUpdate(emergencyId, { provider: providerId }, { new: true });
    if (!emergency) {
      return res.status(404).json({ message: 'Emergency not found' });
    }
    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    // Update provider status
    provider.isAvailable = false;
    await provider.save();
    // Notify user
    sendNotification(emergency.user, {
      title: 'Emergency Assigned',
      body: `Your emergency request has been assigned to a provider.`,
      data: { emergencyId }
    }
    );
    // Notify provider
    sendNotification(providerId, {
      title: 'Emergency Assigned',
      body: `You have been assigned to an emergency request.`,
      data: { emergencyId }
    });
    
    res.json(emergency);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
// Get service providers by service type
const getServiceProvidersByServiceType = async (req, res) => {
  try {
    const { type } = req.params;
    const providers = await Provider.find({ serviceType: type }).populate('user');
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


// Helper function to find nearby providers
async function findNearbyProviders(coordinates, serviceType, maxDistance = 5000) {
  return await Provider.aggregate([
    {
      $geoNear: {
        near: { type: "Point", coordinates },
        distanceField: "distance",
        maxDistance,
        spherical: true,
        query: { 
          serviceType,
          isAvailable: true 
        }
      }
    },
    { $sort: { distance: 1 } },
    { $limit: 5 }
  ]);
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
      }
    }).populate('user');
    
    res.json(emergencies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
// Get all user emergencies
const getAllUserEmergencies = async (req, res) => {
  try {
    const user = req.params.id;
    const userId = req.user?.id;
    if (userId !== user) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const emergencies = await Emergency.find({ user });
    res.json(emergencies);
    } catch (err) {
      res.status(500).json({ error: err.message });
      }
  }
// export modules
module.exports = {
  createEmergency,
  getEmergency,
  getAllEmergencies,
  updateEmergencyStatus,
  getNearbyProviders,
  dispatchEmergency,
  acceptEmergency,
  getServiceProvidersByServiceType,
  getServiceProvidersByLocation,
  getNearbyEmergencies,
  getAllUserEmergencies,
};