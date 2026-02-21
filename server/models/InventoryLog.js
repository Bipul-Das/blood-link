const mongoose = require("mongoose");

const inventoryLogSchema = new mongoose.Schema(
  {
    inventoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: ["used", "discarded", "added", "transfer"],
      required: true,
    },
    units: {
      type: Number,
      required: true,
    },
    bloodGroup: {
      type: String,
      required: true,
    },
    batchNumber: {
      type: String,
      required: true,
    },
    details: {
      type: String, // e.g. "Surgery - Patient John Doe"
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InventoryLog", inventoryLogSchema);