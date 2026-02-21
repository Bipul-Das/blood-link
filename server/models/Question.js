const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    askedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answer: {
      type: String,
      default: null, // Null means unanswered
    },
    answeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "answered"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);