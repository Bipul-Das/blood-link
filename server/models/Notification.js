const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["emergency", "campaign", "system", "request_update"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    // For clickable notifications (e.g., link to specific Request ID)
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    status: {
      type: String,
      enum: ["unread", "read"],
      default: "unread",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);