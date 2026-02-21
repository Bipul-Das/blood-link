const Inventory = require("../models/Inventory");

// @desc    Get logged-in user's donation history
// @route   GET /api/donations/my-history
// @access  Private (Donor)
exports.getDonationHistory = async (req, res) => {
  try {
    // Find inventory items where donorId is the current user
    const history = await Inventory.find({ donorId: req.user._id })
      .populate("hospitalId", "name location") // Get Hospital Name instead of just ID
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching donation history",
      error,
    });
  }
};