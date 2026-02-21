const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

// We only import profile-related controllers here. 
// Login/Register are handled in authRoutes.js
const { 
    updateUserProfile, 
    getUserProfile 
} = require("../controllers/userController");

// --- 1. USER PROFILE ROUTES ---
// Ensure these functions exist in your controller before using them
if (updateUserProfile) router.put("/profile", protect, updateUserProfile);
if (getUserProfile) router.get("/profile", protect, getUserProfile);

// --- 2. ADMIN VERIFICATION ROUTE (The Fix) ---
// GET /api/users/:id
// Used by Admin Dashboard to check real-time donor eligibility
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;