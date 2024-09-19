const Notification = require('./models/Notification');

// // Create a new notification
const createNotification = async (req, res) => {
    try {
        const { recipientId, recipientType, content } = req.body;
        const notification = new Notification({
            recipientId,
            recipientType,
            content
            });
            await notification.save();
            io.emit(`notification-${recipientId}`, newNotification);
            res.status(201).json({ message: 'Notification created successfully' });
            } catch (error) {
                res.status(500).json({ message: 'Error creating notification' });
                }
};
// // Get all notifications for a user
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipientId: req.params.id });
        res.status(200).json(notifications);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching notifications' });
            }
};
// // Mark a notification as read
const markNotificationAsRead = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const notification = await Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true
            });
            if (!notification) {
                return res.status(404).json({ message: 'Notification not found' });
                }
                res.status(200).json({ message: 'Notification marked as read' });
                } catch (error) {
                    res.status(500).json({ message: 'Error marking notification as read' });
                    }
};
// // Delete a notification
const deleteNotification = async (req, res) => {
    try {
        const notificationId = req.params.id;
        await Notification.findByIdAndDelete(notificationId);
        res.status(200).json({ message: 'Notification deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting notification' });
            }
};
module.exports = {
    createNotification,
    getNotifications,
    markNotificationAsRead,
    deleteNotification
    };
    




