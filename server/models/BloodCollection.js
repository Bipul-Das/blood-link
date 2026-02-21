const mongoose = require("mongoose");

const bloodCollectionSchema = new mongoose.Schema(
  {
    collectorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // If the donor is a registered user, we link them here
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    donorName: { type: String, required: true }, // Manual entry (or auto-filled)
    donorSex: { type: String, enum: ["Male", "Female", "Other"], required: true },
    donorAge: { type: Number, required: true },
    donorWeight: { type: Number, required: true },
    // The 6-digit ID used during collection (Mobile or System ID)
    identifier: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 6,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: true,
    },
    quantityUnits: {
      type: Number, // usually 1 bag, but allowing flexibility
      default: 1,
    },
    batchNumber: {
      type: String,
      required: true, // Generated unique batch ID for the bag
      unique: true,
    },
    collectionDate: {
      type: Date,
      default: Date.now,
    },
    location: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BloodCollection", bloodCollectionSchema);