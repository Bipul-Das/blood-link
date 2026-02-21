const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    // The Organization holding the stock (Hospital or Blood Bank)
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Hospital/Blood Bank reference is required"],
    },
    // The Donor who provided this specific bag (for traceability)
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    bloodGroup: {
      type: String,
      required: [true, "Blood Group is required"],
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    units: {
      type: Number,
      required: true,
      default: 1, 
      min: 0 // <--- CHANGED FROM 1 TO 0 (Allows discarding/depleting stock)
    },
    batchNumber: {
      type: String,
      required: [true, "Batch Number is required"],
      unique: true, 
      uppercase: true,
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry Date is required"],
    },
    usageDetails: {
      type: String, 
      default: null
    },
    status: {
      type: String,
      // Ensure 'discarded' is in this list
      enum: ["available", "reserved", "used", "expired", "discarded", "depleted"],
      default: "available",
    },
    // Audit Trail: Who processed this entry?
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
    },
  },
  { timestamps: true }
);

// --- PERFORMANCE INDEXING ---
inventorySchema.index({ expiryDate: 1 });
inventorySchema.index({ hospitalId: 1, bloodGroup: 1, status: 1 });

module.exports = mongoose.model("Inventory", inventorySchema);