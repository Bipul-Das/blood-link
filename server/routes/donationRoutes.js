const express = require("express");
const { getDonationHistory } = require("../controllers/donationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Route: /api/donations/my-history
router.get("/my-history", protect, getDonationHistory);

module.exports = router;