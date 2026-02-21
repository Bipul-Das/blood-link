const Request = require("../models/Request");
const Inventory = require("../models/Inventory");
const User = require("../models/User");
const sendNotification = require("../utils/notificationService");
const InventoryLog = require("../models/InventoryLog"); // Ensure this model exists

// @desc    Get all active emergency requests
// @route   GET /api/requests/active
// @access  Private (All Users)
exports.getActiveRequests = async (req, res) => {
  try {
    const requests = await Request.find({ 
        status: { $in: ["pending", "arranging", "fulfilled", "completed"] } 
      })
      .populate("hospitalId", "name location")
      .populate("requesterId", "name")
      .populate("volunteers.user", "name phone bloodGroup")
      .populate("stockAssignments.inventoryId", "batchNumber units bloodGroup")
      .sort({ urgency: 1, createdAt: -1 });

    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

exports.volunteerForRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });

    // Check if already volunteered
    const alreadyApplied = request.volunteers.some(v => v.user.toString() === req.user._id.toString());
    if (alreadyApplied) {
        return res.status(400).json({ success: false, message: "You have already volunteered." });
    }

    // Add user object
    request.volunteers.push({ user: req.user._id, status: "pending" });
    await request.save();

    res.status(200).json({ success: true, message: "Response sent to Admin" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

// @desc    Create a new blood request
// @route   POST /api/requests
// @access  Private (Any User)
exports.createRequest = async (req, res) => {
  try {
    const { patientName, bloodGroup, units, location, urgency, hospitalName } = req.body;

    const request = await Request.create({
      requesterId: req.user._id,
      patientName,
      bloodGroup,
      units,
      location,
      urgency,
      hospitalId: null, 
      status: "pending"
    });

    console.log(`\x1b[31m[URGENT] New Request for ${bloodGroup} by ${req.user.name}\x1b[0m`);

    res.status(201).json({ success: true, message: "Request created. Admins notified.", request });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating request", error });
  }
};

// @desc    Admin: Find best matching inventory (FIFO)
// @route   GET /api/requests/:id/match
// @access  Private (Admin Only)
exports.findBestMatch = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    const matches = await Inventory.find({
      bloodGroup: request.bloodGroup,
      status: "available",
      expiryDate: { $gt: new Date() } 
    }).sort({ expiryDate: 1 }).populate("hospitalId", "name location");

    res.status(200).json({ success: true, count: matches.length, data: matches });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error finding match", error });
  }
};

// @desc    Admin: Fulfill request with specific inventory item (Partial or Full Deduction)
// @route   POST /api/requests/:id/fulfill
exports.fulfillWithStock = async (req, res) => {
  try {
    // 1. GET UNITS USED FROM FRONTEND
    const { inventoryId, unitsUsed } = req.body;
    
    // Fetch Request & Bag
    const request = await Request.findById(req.params.id);
    const bag = await Inventory.findById(inventoryId).populate("hospitalId");

    if (!request || !bag) {
      return res.status(404).json({ message: "Request or Bag not found" });
    }

    if (bag.status !== "available") {
      return res.status(400).json({ message: "This bag is no longer available" });
    }

    // 2. DETERMINE AMOUNT TO DEDUCT
    // Use the custom amount from Admin, otherwise default to full request amount (fallback)
    const amountToDeduct = unitsUsed ? parseInt(unitsUsed) : request.units;

    // 3. CHECK QUANTITY (Validation)
    if (bag.units < amountToDeduct) {
        return res.status(400).json({ 
            message: `Insufficient stock in this batch. Batch has ${bag.units}, you tried to use ${amountToDeduct}.` 
        });
    }

    // 4. DEDUCT UNITS
    bag.units = bag.units - amountToDeduct;
    
    // 5. UPDATE STATUS BASED ON REMAINING UNITS
    if (bag.units === 0) {
        bag.status = "used";
        bag.usageDetails = `Fully used for Request #${request._id}`;
    }
    
    await bag.save();

    // --- LOGGING START ---
    try {
        await InventoryLog.create({
            inventoryId: bag._id,
            hospitalId: bag.hospitalId._id,
            action: "used",
            units: amountToDeduct, // Log the actual amount used
            bloodGroup: bag.bloodGroup,
            batchNumber: bag.batchNumber,
            details: `Admin Allocation: Used ${amountToDeduct} units for Request #${request._id} (Patient: ${request.patientName})`
        });
        console.log("✅ Inventory Log Created for Admin Allocation");
    } catch (logError) {
        console.error("⚠️ Failed to create Inventory Log:", logError);
    }
    // --- LOGGING END ---

    // 6. MARK REQUEST AS FULFILLED / ARRANGING
    request.status = "arranging"; 
    request.fulfilledBy = req.user._id;
    request.hospitalId = bag.hospitalId._id;

    // Push the assignment with the specific amount used
    request.stockAssignments.push({
        inventoryId: bag._id,
        unitsAssigned: amountToDeduct 
    });
    
    await request.save();

    // 7. NOTIFICATIONS
    await sendNotification({
      userId: request.requesterId,
      type: "request_fulfilled",
      message: `GOOD NEWS! ${amountToDeduct} unit(s) of blood have been arranged from ${bag.hospitalId.name}.`,
      relatedId: request._id
    });

    res.status(200).json({ 
        success: true, 
        message: `Allocated ${amountToDeduct} units. Remaining in batch: ${bag.units}` 
    });

  } catch (error) {
    console.error("Fulfillment Error:", error);
    res.status(500).json({ success: false, message: "Error fulfilling request", error });
  }
};

// @desc    Admin: Mark Donor Found (Stops volunteers)
// @route   PUT /api/requests/:id/donor-found
// @access  Private (Admin Only)
exports.markDonorFound = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = "arranging"; 
    await request.save();

    res.status(200).json({ success: true, message: "Status updated to Donor Found." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating status", error });
  }
};

// @desc    Admin: Assign a specific volunteer (Confirm Donation)
// @route   POST /api/requests/:id/assign-volunteer
// @access  Private (Admin Only)
exports.assignVolunteer = async (req, res) => {
  try {
    const { volunteerId } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) return res.status(404).json({ success: false, message: "Request not found" });

    // 1. Find the volunteer in the request's list
    const volunteerEntry = request.volunteers.find(v => v.user.toString() === volunteerId);
    
    if (!volunteerEntry) {
        return res.status(404).json({ success: false, message: "Volunteer not found in this request" });
    }

    // 2. Update Request Status (Mark as Assigned)
    volunteerEntry.status = "assigned";
    request.status = "arranging"; 
    await request.save();

    // --- 3. THE FIX: UPDATE DONOR DATE IMMEDIATELY ---
    // This makes them ineligible in their dashboard instantly
    await User.findByIdAndUpdate(volunteerId, {
        lastDonationDate: new Date() // Set to NOW
    });
    console.log(`✅ Donor ${volunteerId} confirmed. Eligibility updated.`);
    // -------------------------------------------------

    // 4. Notify User
    await sendNotification({
      userId: volunteerId,
      type: "volunteer_selected",
      message: `CONFIRMED: You have been selected to donate for ${request.patientName}. Please proceed to the location.`,
      relatedId: request._id
    });

    res.status(200).json({ success: true, message: "Volunteer assigned & Donor Eligibility Updated" });
  } catch (error) {
    console.error("Assign Error:", error);
    res.status(500).json({ success: false, message: "Error assigning volunteer", error });
  }
};

// @desc    Mark request as Completed & UPDATE DONOR HISTORY
// @route   PUT /api/requests/:id/complete
exports.markRequestComplete = async (req, res) => {
  try {
    // 1. Populate volunteers to get access to User IDs
    const request = await Request.findById(req.params.id).populate("volunteers.user");

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    // 2. Auth Check (Admin OR The Original Requester can complete it)
    if (request.requesterId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // 3. UPDATE REQUEST STATUS
    request.status = "completed";
    await request.save();

    // 4. CRITICAL: UPDATE DONOR DATES
    // We look for volunteers who were "assigned" (selected by admin) 
    // OR if the system auto-assigned a donor (depending on your flow).
    // If no specific 'assigned' status exists, you might want to update ALL volunteers 
    // involved, but usually, we only update the one who actually donated.
    
    const donorsToUpdate = request.volunteers.filter(v => v.status === "assigned");

    if (donorsToUpdate.length > 0) {
        for (const vol of donorsToUpdate) {
            if (vol.user) {
                await User.findByIdAndUpdate(vol.user._id, {
                    lastDonationDate: new Date() // Sets to NOW
                });
                console.log(`✅ BLOCKED: Donor ${vol.user.name} marked as ineligible (Date Updated).`);
            }
        }
    } else {
        // Fallback: If no one was explicitly "assigned" but the request is done, 
        // and it was a specific volunteer flow, you might want to handle that here.
        console.log("⚠️ Request completed, but no 'assigned' volunteers found to update.");
    }

    res.status(200).json({ 
        success: true, 
        message: `Request completed. Donor eligibility updated.` 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};