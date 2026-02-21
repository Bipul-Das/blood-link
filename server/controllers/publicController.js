const User = require("../models/User");
const Inventory = require("../models/Inventory");
const Campaign = require("../models/Campaign");

exports.getPublicStats = async (req, res) => {
  try {
    // Count Documents concurrently for speed
    const [donors, hospitals, bloodbanks, volunteers, campaigns] = await Promise.all([
      User.countDocuments({ role: "donor" }),
      User.countDocuments({ role: "hospital" }),
      User.countDocuments({ role: "bloodbank" }),
      User.countDocuments({ role: "volunteer" }),
      Campaign.countDocuments({ date: { $gte: new Date() } }) // Active campaigns
    ]);

    // Aggregate total units from Inventory
    const inventoryData = await Inventory.aggregate([
      { $group: { _id: null, totalUnits: { $sum: "$units" } } }
    ]);
    const units = inventoryData.length > 0 ? inventoryData[0].totalUnits : 0;

    res.status(200).json({
      success: true,
      data: {
        donors,
        units,
        campaigns,
        partners: hospitals + bloodbanks,
        volunteers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching stats" });
  }
};