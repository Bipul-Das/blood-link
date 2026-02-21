const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    // Track interested users
    participants: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }],
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Campaign", campaignSchema);