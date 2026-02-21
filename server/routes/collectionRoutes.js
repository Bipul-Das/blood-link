const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { createCollection, getMyCollections, getMyDonationHistory, searchDonors } = require("../controllers/collectionController");
// Only Collectors and Admins can access
router.post("/", protect, authorize("collector", "admin", "lead_dev"), createCollection);
router.get("/", protect, authorize("collector", "admin", "lead_dev"), getMyCollections);
router.get("/my-history", protect, getMyDonationHistory);
router.get("/search-donor", protect, authorize("collector", "admin", "lead_dev"), searchDonors);

module.exports = router;