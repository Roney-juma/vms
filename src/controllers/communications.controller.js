const {Emergency,Message} = require('../models');
const { sendNotification } = require('../service/notification.service');

// Send message in emergency chat
const sendMessage = async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const { content, type } = req.body;
    const sender = req.user.id;

    // Verify user is part of this emergency
    const emergency = await Emergency.findOne({
      _id: emergencyId,
      $or: [{ user: sender }, { provider: sender }]
    });

    if (!emergency) {
      return res.status(403).json({ error: 'Not authorized for this emergency' });
    }

    const message = new Message({
      emergency: emergencyId,
      sender,
      content,
      type: type || 'text' // text, image, voice
    });

    await message.save();

    // Notify the other party
    const recipient = emergency.user.equals(sender) ? emergency.provider : emergency.user;
    if (recipient) {
      await sendNotification(recipient, {
        title: 'New Message',
        body: type === 'text' ? content : 'New media message',
        data: { emergencyId, messageId: message._id }
      });
    }

    // Emit real-time event
    req.app.get('io').to(emergencyId).emit('newMessage', message);

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all messages for an emergency
const getMessages = async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const userId = req.user.id;

    // Verify user is part of this emergency
    const emergency = await Emergency.findOne({
      _id: emergencyId,
      $or: [{ user: userId }, { provider: userId }]
    });

    if (!emergency) {
      return res.status(403).json({ error: 'Not authorized for this emergency' });
    }

    const messages = await Message.find({ emergency: emergencyId })
      .sort({ createdAt: 1 })
      .populate('sender', 'name avatar');

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Initiate voice call
const initiateCall = async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const callerId = req.user.id;

    // Verify user is part of this emergency
    const emergency = await Emergency.findOne({
      _id: emergencyId,
      $or: [{ user: callerId }, { provider: callerId }]
    });

    if (!emergency) {
      return res.status(403).json({ error: 'Not authorized for this emergency' });
    }

    const calleeId = emergency.user.equals(callerId) ? emergency.provider : emergency.user;

    // Notify the other party to start call
    await sendNotification(calleeId, {
      title: 'Incoming Call',
      body: 'Emergency call request',
      data: { 
        emergencyId,
        callType: 'voice',
        callerId 
      }
    });

    res.json({ success: true, calleeId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// End voice call
const endCall = async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const userId = req.user.id;

    // Verify user is part of this emergency
    const emergency = await Emergency.findOne({
      _id: emergencyId,
      $or: [{ user: userId }, { provider: userId }]
    });

    if (!emergency) {
      return res.status(403).json({ error: 'Not authorized for this emergency' });
    }

    const otherPartyId = emergency.user.equals(userId) ? emergency.provider : emergency.user;

    // Notify the other party that call ended
    await sendNotification(otherPartyId, {
      title: 'Call Ended',
      body: 'The call has been ended',
      data: { emergencyId, callEnded: true }
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Upload media (image/voice note)
const uploadMedia = async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const sender = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Verify user is part of this emergency
    const emergency = await Emergency.findOne({
      _id: emergencyId,
      $or: [{ user: sender }, { provider: sender }]
    });

    if (!emergency) {
      return res.status(403).json({ error: 'Not authorized for this emergency' });
    }

    const message = new Message({
      emergency: emergencyId,
      sender,
      content: file.path,
      type: file.mimetype.startsWith('image/') ? 'image' : 'voice'
    });

    await message.save();

    // Notify the other party
    const recipient = emergency.user.equals(sender) ? emergency.provider : emergency.user;
    if (recipient) {
      await sendNotification(recipient, {
        title: 'New Media',
        body: `New ${message.type} message`,
        data: { emergencyId, messageId: message._id }
      });
    }

    // Emit real-time event
    req.app.get('io').to(emergencyId).emit('newMessage', message);

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
module.exports = {
  sendMessage,
  getMessages,
  initiateCall,
  endCall,
  uploadMedia
};