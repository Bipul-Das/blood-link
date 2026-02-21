const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { createCampaign, getAllCampaigns, joinCampaign } = require("../controllers/campaignController");

// Public (Logged in) routes
router.get("/", protect, getAllCampaigns);
router.put("/:id/join", protect, joinCampaign);

// Admin only routes
router.post("/", protect, authorize("admin", "lead_dev"), createCampaign);

module.exports = router;