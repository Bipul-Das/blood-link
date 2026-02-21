const BloodCollection = require("../models/BloodCollection");
const User = require("../models/User");
const Inventory = require("../models/Inventory");

// @desc    Record a new blood collection
// @route   POST /api/collections
// @access  Private (Collector/Admin)
exports.createCollection = async (req, res) => {
  try {
    console.log("📥 Receiving Collection Data:", req.body);

    const { 
        identifier, 
        bloodGroup, 
        quantityUnits, 
        location, 
        notes,
        donorName, 
        donorSex, 
        donorAge, 
        donorWeight 
    } = req.body;

    // 1. Validation
    if (!identifier || !bloodGroup || !quantityUnits || !location) {
        return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    // 2. Find Donor
    const donorUser = await User.findOne({
        $or: [{ bloodLinkId: identifier }, { phone: identifier }]
    });

    // 3. Prepare Final Data
    const finalName = donorUser ? donorUser.name : (donorName || "Walk-in Donor");
    
    // Calculate Age
    let finalAge = Number(donorAge) || 0;
    if (donorUser && donorUser.dateOfBirth) {
        const diff = Date.now() - new Date(donorUser.dateOfBirth).getTime();
        finalAge = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    }
    
    const finalWeight = donorUser && donorUser.weight ? donorUser.weight : Number(donorWeight) || 0;
    const finalSex = donorUser && donorUser.gender ? donorUser.gender : (donorSex || "Unknown");

    // 4. Create Collection Record
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.floor(1000 + Math.random() * 9000);
    const batchNumber = `BN-${dateStr}-${random}`;

    const collection = await BloodCollection.create({
      collectorId: req.user._id,
      donorId: donorUser ? donorUser._id : null,
      identifier,
      
      donorName: finalName,
      donorSex: finalSex,
      donorAge: finalAge,
      donorWeight: finalWeight,

      bloodGroup,
      quantityUnits: Number(quantityUnits),
      batchNumber,
      location,
      notes
    });

    console.log("✅ Collection Created:", collection._id);

    // 5. UPDATE DONOR PROFILE (WITH AUTO-FIX FOR LEGACY DATA)
    if (donorUser) {
      console.log("🔄 Updating Donor Profile...");

      // Update basic stats
      donorUser.lastDonationDate = new Date();
      if (donorWeight && Number(donorWeight) > 0) donorUser.weight = Number(donorWeight);

      // --- FIX: HANDLE LEGACY LOCATION DATA ---
      // If 'location' is strictly an object (Legacy Data), flatten it.
      if (typeof donorUser.location === 'object' && donorUser.location !== null) {
          console.log("⚠️ Legacy Location Object Detected. Fixing...");
          // Try to extract city from the bad object
          const oldLoc = donorUser.location; 
          donorUser.location = oldLoc.city || "Unknown Area"; // Flatten to String
          
          // Backfill missing fields if possible
          if (!donorUser.address && oldLoc.address) donorUser.address = oldLoc.address;
          if (!donorUser.city && oldLoc.city) donorUser.city = oldLoc.city;
      }

      // --- FIX: FILL MISSING REQUIRED FIELDS ---
      // If fields are still missing (undefined/null/empty), set placeholders to pass validation
      if (!donorUser.address) donorUser.address = "Update Required";
      if (!donorUser.city) donorUser.city = "Update Required";
      if (!donorUser.location || typeof donorUser.location === 'object') donorUser.location = "Update Required";

      await donorUser.save();
      console.log("✅ Donor Profile Updated");
    }


    const inventoryOwnerId = req.user.affiliatedHospital ? req.user.affiliatedHospital : req.user._id;
    // 6. Inventory Update
    await Inventory.create({
      hospitalId: inventoryOwnerId, 
      bloodGroup,
      units: Number(quantityUnits),
      batchNumber,
      expiryDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), 
      status: 'available',
      source: 'collection_drive',processedBy: req.user._id
    });
console.log(`✅ Inventory added to Hospital ID: ${inventoryOwnerId}`);
    res.status(201).json({ 
        success: true, 
        message: "Collection Recorded Successfully", 
        data: collection 
    });

  } catch (error) {
    console.error("❌ COLLECTION ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error: " + error.message });
  }
};

// @desc    Get collections made by this collector
exports.getMyCollections = async (req, res) => {
  try {
    const collections = await BloodCollection.find({ collectorId: req.user._id })
      .populate("donorId", "name email phone")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: collections });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Get my own donation history
exports.getMyDonationHistory = async (req, res) => {
  try {
    const history = await BloodCollection.find({ donorId: req.user._id })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: history.length, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Search donors
exports.searchDonors = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ success: false, message: "Query required" });

    const donors = await User.find({
      role: { $ne: 'admin' }, 
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
        { bloodLinkId: query } 
      ]
    }).select("name phone bloodGroup gender dateOfBirth weight lastDonationDate bloodLinkId"); 

    res.status(200).json({ success: true, count: donors.length, data: donors });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};