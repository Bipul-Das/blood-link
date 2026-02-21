const express = require("express");
const {
  registerController,
  loginController,
  currentUserController,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { getUserProfile, updateUserProfile, getHospitals } = require("../controllers/userController");

const router = express.Router();

// Public Routes
router.post("/register", registerController);
router.post("/login", loginController);
router.get("/hospitals", getHospitals);

// Private Route (Token Required)
router.get("/current-user", protect, currentUserController);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile); // <--- Add this

module.exports = router;