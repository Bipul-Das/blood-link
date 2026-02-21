const User = require("../models/User");
const bcrypt = require("bcryptjs");

// @desc    Get User Profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update User Profile
// @route   PUT /api/auth/profile
exports.updateUserProfile = async (req, res) => {
  try {
    // 1. Get User + Password (needed to verify old password)
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 2. Update Basic Fields
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.bloodGroup = req.body.bloodGroup || user.bloodGroup;
    user.address = req.body.address || user.address;
    user.city = req.body.city || user.city;
    user.location = req.body.location || user.location;

    // 3. Update Number/Date Fields (Validation)
    if (req.body.weight !== "" && req.body.weight !== undefined) {
        user.weight = Number(req.body.weight);
    }
    if (req.body.dateOfBirth !== "" && req.body.dateOfBirth !== undefined) {
        user.dateOfBirth = req.body.dateOfBirth;
    }

    // 4. Handle Password Change (CRITICAL FIX)
    if (req.body.password && req.body.newPassword) {
        // A. Verify OLD password
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Incorrect current password" });
        }
        
        // B. Set NEW password as PLAIN TEXT
        // The User.js 'pre-save' hook will hash this automatically.
        // DO NOT hash it here, or it will be hashed twice!
        user.password = req.body.newPassword; 
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Profile Updated Successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        bloodGroup: updatedUser.bloodGroup,
        address: updatedUser.address,
        city: updatedUser.city,
        location: updatedUser.location,
        weight: updatedUser.weight,
        dateOfBirth: updatedUser.dateOfBirth,
        lastDonationDate: updatedUser.lastDonationDate,
      },
    });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ success: false, message: "Update Failed", error: error.message });
  }
};

// @desc    Get Hospitals & Blood Banks
exports.getHospitals = async (req, res) => {
  try {
    const entities = await User.find({ role: { $in: ['hospital', 'bloodbank'] } })
      .select("name email phone address city location role");
    res.status(200).json({ success: true, count: entities.length, data: entities });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ... existing imports and functions ...

