const admin = require('firebase-admin');
const {User} = require('../models');

// Initialize Firebase Admin SDK
const serviceAccount = require('../keys/firebase-adminsdk.json');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// Send push notification
exports.sendNotification = async (userId, payload) => {
  try {
    const user = await User.findById(userId);
    if (user && user.fcmToken) {
      await admin.messaging().sendToDevice(user.fcmToken, {
        notification: {
          title: payload.title,
          body: payload.body
        },
        data: payload.data
      });
    }
  } catch (err) {
    console.error('Error sending notification:', err);
  }
};

// Send SMS (using Twilio or similar)
exports.sendSMS = async (phoneNumber, message) => {
  // Implementation using Twilio API
};