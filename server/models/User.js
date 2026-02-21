const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"] },
    email: { 
      type: String, 
      required: [true, "Email is required"], 
      unique: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/, "Please add a valid email"]
    },
    password: { type: String, required: [true, "Password is required"], select: false },
    role: { type: String, default: "donor" },
    bloodLinkId: { type: String, unique: true },
    bloodGroup: { type: String },
    phone: { type: String, required: [true, "Phone is required"], unique: true },
    // --- ADD THIS SECTION ---
  // For Collectors: Links them to a specific Hospital/Blood Bank
  affiliatedHospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    default: null
  },

    // Location Fields
    address: { type: String, required: [true, "Street Address is required"] },
    city: { type: String, required: [true, "City is required"] },
    location: { type: String, required: [true, "Area/District is required"] },

    weight: { type: Number },
    dateOfBirth: { type: Date },
    lastDonationDate: { type: Date, default: null },
  },
  { timestamps: true }
);

// --- FIX: Modern Async Hooks (No 'next') ---

// 1. Hash Password
userSchema.pre("save", async function () {
  // If password is not modified, simply return (exit)
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// 2. Generate ID
userSchema.pre("save", async function () {
  if (!this.bloodLinkId) {
    let unique = false;
    let newId = "";
    while (!unique) {
      newId = Math.floor(100000 + Math.random() * 900000).toString();
      // Use this.constructor to query the database
      const existingUser = await this.constructor.findOne({ bloodLinkId: newId });
      if (!existingUser) unique = true;
    }
    this.bloodLinkId = newId;
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);