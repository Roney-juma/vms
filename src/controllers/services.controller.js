const {Provider,Emergency} = require('../models');
const { calculateDistance,formatDistance } = require('../utils/geo');

// Discover nearby services
exports.discoverServices = async (req, res) => {
  try {
    const { coordinates, radius = 5000, serviceType } = req.query;
    const [longitude, latitude] = coordinates.split(',').map(Number);

    if (!longitude || !latitude) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    const query = {
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          $maxDistance: parseInt(radius)
        }
      },
      isAvailable: true
    };

    if (serviceType) {
      query.serviceType = serviceType;
    }
    console.log(query)
    const providers = await Provider.find(query)
      .populate('user', 'name avatar rating')
      .limit(20);

    // Add distance to each provider
    const providersWithDistance = providers.map(provider => {
      const distance = calculateDistance(
        [longitude, latitude],
        provider.location.coordinates
      );
      return {
        ...provider.toObject(),
        distance,
        formattedDistance: formatDistance(distance)
      };
    });

    res.json(providersWithDistance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get service provider details
exports.getServiceDetails = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.providerId)
      .populate('user', 'name avatar rating')
      .populate('reviews.user', 'name avatar');

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    res.json(provider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Search services by name/type
exports.searchServices = async (req, res) => {
  try {
    const { q, coordinates } = req.query;
    const [longitude, latitude] = coordinates.split(',').map(Number);

    const query = {
      $or: [
        { companyName: { $regex: q, $options: 'i' } },
        { serviceType: { $regex: q, $options: 'i' } }
      ],
      isAvailable: true
    };

    let providers = await Provider.find(query)
      .populate('user', 'name avatar rating');

    // If coordinates provided, calculate distance
    if (longitude && latitude) {
      providers = providers.map(provider => {
        const distance = calculateDistance(
          [longitude, latitude],
          provider.location.coordinates
        );
        return {
          ...provider.toObject(),
          distance,
          formattedDistance: formatDistance(distance)
        };
      }).sort((a, b) => a.distance - b.distance);
    }

    res.json(providers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get nearby fuel stations
exports.getFuelStations = async (req, res) => {
  try {
    const { coordinates, radius = 5000, fuelType } = req.query;
    const [longitude, latitude] = coordinates.split(',').map(Number);

    // In a real implementation, you would use Google Places API or similar
    // This is a mock implementation using our Provider model
    
    const query = {
      serviceType: 'fuel',
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          $maxDistance: parseInt(radius)
        }
      }
    };

    if (fuelType) {
      query.fuelTypes = fuelType; // Assuming Provider has fuelTypes field
    }

    const stations = await Provider.find(query)
      .populate('user', 'name avatar rating');

    // Add distance to each station
    const stationsWithDistance = stations.map(station => {
      const distance = calculateDistance(
        [longitude, latitude],
        station.location.coordinates
      );
      return {
        ...station.toObject(),
        distance,
        formattedDistance: formatDistance(distance)
      };
    });

    res.json(stationsWithDistance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Request mobile fuel delivery
exports.requestMobileFuel = async (req, res) => {
  try {
    const { coordinates, fuelType, amount } = req.body;
    const userId = req.user.id;

    // Create a special type of emergency for fuel delivery
    const emergency = new Emergency({
      user: userId,
      type: 'fuel',
      location: {
        type: 'Point',
        coordinates
      },
      description: `Request for ${amount} liters of ${fuelType}`,
      status: 'pending',
      fuelDetails: {
        type: fuelType,
        amount,
        deliveryRequested: true
      }
    });

    await emergency.save();

    // Find nearby fuel providers who offer mobile delivery
    const providers = await Provider.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates },
          distanceField: "distance",
          maxDistance: 10000,
          spherical: true,
          query: { 
            serviceType: 'fuel',
            offersMobileDelivery: true,
            isAvailable: true 
          }
        }
      },
      { $sort: { distance: 1 } },
      { $limit: 5 }
    ]);

    // Notify providers
    providers.forEach(provider => {
      sendNotification(provider.user, {
        title: 'Fuel Delivery Request',
        body: `${amount}L of ${fuelType} requested nearby`,
        data: { emergencyId: emergency._id }
      });
    });

    res.status(201).json(emergency);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};