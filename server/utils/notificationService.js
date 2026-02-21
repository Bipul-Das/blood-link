const Notification = require("../models/Notification");

/**
 * centralized Notification Handler
 * @param {Object} data - { userId, type, message, relatedId }
 */
const sendNotification = async ({ userId, type, message, relatedId }) => {
  try {
    // 1. Create In-App Notification (Database)
    await Notification.create({
      recipient: userId,
      type,
      message,
      relatedId,
    });

    // 2. Mock Email Sending (Future Integration Point)
    // In production, we would check User preferences here
    console.log(`\x1b[35m[EMAIL SENT]\x1b[0m To User ${userId}: ${message}`);

    // 3. Mock SMS/WhatsApp Sending (Future Integration Point)
    if (type === "emergency") {
        console.log(`\x1b[35m[WHATSAPP SENT]\x1b[0m To User ${userId}: URGENT - ${message}`);
    }

  } catch (error) {
    console.error("Notification Service Error:", error);
    // We don't throw error here to avoid breaking the main request flow
  }
};

module.exports = sendNotification;