const Inventory = require("../models/Inventory");
const InventoryLog = require("../models/InventoryLog");

// @desc    Add new blood unit
// @route   POST /api/inventory
// @access  Private (Hospital/BloodBank)
exports.addInventoryItem = async (req, res) => {
  try {
    const { bloodGroup, batchNumber, expiryDate, units } = req.body;

    // Check if batch exists
    const exists = await Inventory.findOne({ batchNumber });
    if (exists) {
      return res.status(400).json({ success: false, message: "Batch number must be unique" });
    }

    const inventory = await Inventory.create({
      hospitalId: req.user._id,
      bloodGroup,
      batchNumber,
      expiryDate,
      units: units || 1, // Default to 1 if missing
      status: "available",
      processedBy: req.user._id
    });

    res.status(201).json({ success: true, message: "Unit added to stock", inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding unit", error: error.message });
  }
};

// @desc    Get current available stock (FIFO)
// @route   GET /api/inventory
// @access  Private (Hospital/BloodBank)
exports.getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find({ 
      hospitalId: req.user._id,
      status: "available",
      units: { $gt: 0 } // Only fetch items with stock > 0
    }).sort({ expiryDate: 1 }); // Oldest first (FIFO)

    res.status(200).json({ success: true, count: inventory.length, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching inventory", error: error.message });
  }
};

// @desc    Update status (Deduct Units OR Discard)
// @route   PUT /api/inventory/:id/status
exports.updateInventoryStatus = async (req, res) => {
  try {
    console.log("🔄 Receiving Update Request:", req.body); // DEBUG LOG

    const { status, usageDetails, unitsUsed } = req.body; 
    const item = await Inventory.findById(req.params.id);

    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    // 1. CALCULATE DEDUCTION & UPDATE STATUS
    let deductedAmount = 0;
    
    if (status === "used") {
        // Validation: Ensure valid number
        if (!unitsUsed || unitsUsed <= 0) {
            return res.status(400).json({ message: "Invalid quantity entered" });
        }
        // Validation: Check Stock
        if (unitsUsed > item.units) {
            return res.status(400).json({ message: `Not enough stock. Only ${item.units} units available.` });
        }

        item.units = item.units - unitsUsed;
        deductedAmount = unitsUsed;

        // If empty, mark as used/depleted
        if (item.units === 0) {
            item.status = "used"; 
        }
    } 
    else if (status === "discarded") {
        // Discarding removes ALL remaining units in this batch
        deductedAmount = item.units; 
        item.units = 0;
        item.status = "discarded";
    }

    // 2. SAVE INVENTORY UPDATE (With Error Catching)
    try {
        await item.save();
    } catch (saveError) {
        console.error("❌ INVENTORY SAVE ERROR:", saveError);
        return res.status(500).json({ 
            success: false, 
            message: "Database Save Failed: " + saveError.message 
        });
    }

    // 3. CREATE HISTORY LOG (With Error Catching)
    try {
        await InventoryLog.create({
            inventoryId: item._id,
            hospitalId: req.user._id,
            action: status,
            units: deductedAmount, // Log exactly how many were removed
            details: usageDetails || (status === "discarded" ? "Stock Discarded" : "Used for Patient"),
            batchNumber: item.batchNumber, // Snapshot for history
            bloodGroup: item.bloodGroup    // Snapshot for history
        });
    } catch (logError) {
        console.error("⚠️ LOGGING ERROR (Non-Fatal):", logError);
        // Note: We don't return 500 here, we just log the error so the UI operation succeeds.
    }

    res.status(200).json({ success: true, message: "Updated & Logged", item });

  } catch (error) {
    console.error("❌ GENERAL CONTROLLER ERROR:", error);
    res.status(500).json({ success: false, message: "Error updating status", error: error.message });
  }
};

// @desc    Get Inventory History (Transaction Logs)
// @route   GET /api/inventory/history
// @access  Private (Hospital/BloodBank)
exports.getInventoryHistory = async (req, res) => {
  try {
    // Fetch logs (Transactions) instead of just finished items
    const logs = await InventoryLog.find({ hospitalId: req.user._id })
      .sort({ createdAt: -1 }); // Newest logs first

    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching history", error: error.message });
  }
};