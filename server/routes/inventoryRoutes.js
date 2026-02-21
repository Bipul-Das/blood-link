const express = require("express");
const { 
    addInventoryItem, 
    getInventory, 
    updateInventoryStatus, 
    getInventoryHistory 
} = require("../controllers/inventoryController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Apply protection to all routes (Must be logged in)
router.use(protect);

// @route   POST /api/inventory   -> Add Item
// @route   GET  /api/inventory   -> Get Current Stock
router.route("/")
    .post(addInventoryItem)
    .get(getInventory);

// @route   GET /api/inventory/history -> Get Logs
router.get("/history", getInventoryHistory);

// @route   PUT /api/inventory/:id/status -> Use/Discard Item
router.put("/:id/status", updateInventoryStatus);

module.exports = router;