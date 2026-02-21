const express = require("express");
const { 
  createRequest, 
  getActiveRequests, 
  volunteerForRequest,
  findBestMatch,
  fulfillWithStock,
  markDonorFound,
  assignVolunteer,
  markRequestComplete 
} = require("../controllers/requestController"); // Import new functions

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Public (Logged In)
router.post("/", protect, createRequest);
router.get("/active", protect, getActiveRequests);
router.post("/:id/volunteer", protect, volunteerForRequest);
router.put("/:id/complete", protect, markRequestComplete);

// Admin Only Operations
router.get("/:id/match", protect, authorize("admin", "lead_dev"), findBestMatch);
router.post("/:id/fulfill", protect, authorize("admin", "lead_dev"), fulfillWithStock);
router.put("/:id/donor-found", protect, authorize("admin", "lead_dev"), markDonorFound);
router.post("/:id/assign-volunteer", protect, authorize("admin", "lead_dev"), assignVolunteer);

module.exports = router;