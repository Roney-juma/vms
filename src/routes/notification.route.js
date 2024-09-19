const notificationController = require("../controllers/notification.controller")
const express =require("express")

const router = express.Router();
router.post("/", notificationController.createNotification);
router.get("/", notificationController.getNotifications);
router.get("/:id", notificationController.getNotificationById);
router.put("/:id", notificationController.updateNotification);
router.delete("/:id", notificationController.deleteNotification);
router.put('/notifications/:notificationId', notificationController.markNotificationAsRead);


module.exports = router;
