const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessages,
  initiateCall,
  endCall,
  uploadMedia
} = require('../controllers/communications.controller');
const verifyToken = require("../middlewheres/verifyToken");

router.use(verifyToken())


// Send message in emergency chat
router.post('/:emergencyId/messages', sendMessage);

// Get all messages for an emergency
router.get('/:emergencyId/messages', getMessages);

// Initiate voice call
router.post('/:emergencyId/call/start', initiateCall);

// End voice call
router.post('/:emergencyId/call/end', endCall);

// Upload image/voice note
// router.post('/:emergencyId/media', upload.single('media'), uploadMedia);

module.exports = router;