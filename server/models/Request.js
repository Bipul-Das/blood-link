const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientName: {
      type: String,
      required: [true, "Patient name is required"], // New Field
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Can be null if generic request
      default: null
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: [true, "Blood group is required"],
    },
    units: {
      type: Number,
      required: [true, "Number of units is required"], // Changed from quantity to units
      min: 1,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    urgency: {
      type: String,
      enum: ["standard", "critical"],
      default: "standard",
    },
    status: { 
      type: String, 
      // Added "completed" to the list
      enum: ["pending", "arranging", "fulfilled", "cancelled", "completed"], 
      default: "pending" 
    },
    volunteers: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: { type: String, enum: ["pending", "assigned"], default: "pending" }
    }],

    // --- NEW: Track Assigned Stock Batches ---
    stockAssignments: [{
      inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory" },
      unitsAssigned: Number,
      assignedAt: { type: Date, default: Date.now }
    }],
    fulfilledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

// --- INDEXING FOR DASHBOARDS ---

// 1. Emergency Feed Sort:
// Most critical requests first, then by date.
requestSchema.index({ urgency: 1, createdAt: -1 });

// 2. Status Filter:
// Quickly find all "pending" requests.
requestSchema.index({ status: 1 });

module.exports = mongoose.model("Request", requestSchema);