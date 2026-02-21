const Notification = require("../models/Notification");

// @desc    Get my notifications
// @route   GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 }); // Newest first
    
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching notifications", error });
  }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/read
exports.markAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, status: "unread" },
      { status: "read" }
    );
    res.status(200).json({ success: true, message: "Notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating notifications", error });
  }
};