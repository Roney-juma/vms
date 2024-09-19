const Assessor = require('../models/assessor.model');
const Garage = require('../models/garage.model');
const Supplier = require('../models/supplier.model');

const addRatingAndFeedback = async (entityId, entityType, customerId, rating, feedback) => {
  let entity;

  switch(entityType) {
    case 'assessor':
      entity = await Assessor.findById(entityId);
      break;
    case 'garage':
      entity = await Garage.findById(entityId);
      break;
    case 'supplier':
      entity = await Supplier.findById(entityId);
      break;
    default:
      throw new Error('Invalid entity type');
  }

  if (!entity) throw new Error(`${entityType} not found`);

  // Add the new rating
  entity.ratings.reviews.push({ customerId, rating, feedback });
  entity.ratings.totalRatings += 1;

  // Recalculate the average rating
  const totalSum = entity.ratings.reviews.reduce((acc, review) => acc + review.rating, 0);
  entity.ratings.averageRating = totalSum / entity.ratings.totalRatings;

  await entity.save();
  return entity;
};
const getRatings = async (entityId, entityType) => {
    let entity;
  
    switch (entityType) {
      case 'assessor':
        entity = await Assessor.findById(entityId);
        break;
      case 'garage':
        entity = await Garage.findById(entityId);
        break;
      case 'supplier':
        entity = await Supplier.findById(entityId);
        break;
      default:
        throw new Error('Invalid entity type');
    }
  
    if (!entity) {
      throw new Error(`${entityType} not found`);
    }
  
    return entity.ratings;
  };

module.exports = {
  addRatingAndFeedback,
  getRatings

};
