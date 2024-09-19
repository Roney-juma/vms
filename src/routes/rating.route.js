const express = require('express');
const ratingController = require('../controllers/rating.controller');
const verifyToken = require('../middlewheres/verifyToken');
const router = express.Router();

// Route for submitting ratings
router.post('/:entityType/:entityId', ratingController.submitRating);
// Route for retrieving ratings
router.get('/:entityType/:entityId',verifyToken(['admin']), ratingController.getRatings);


module.exports = router;
