const express = require('express');
const ratingController = require('../controllers/rating.controller');
const router = express.Router();

// Route for submitting ratings
router.post('/:entityType/:entityId', ratingController.submitRating);
// Route for retrieving ratings
router.get('/:entityType/:entityId', ratingController.getRatings);


module.exports = router;
