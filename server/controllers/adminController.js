const User = require("../models/User");

// @desc    Get all users (Staff & Donors)
// @route   GET /api/admin/users
// @access  Private (Admin/Lead Dev)
exports.getAllUsers = async (req, res) => {
  try {
    // Exclude the current user to prevent accidental self-deletion
    const users = await User.find({ _id: { $ne: req.user._id } }).select("-password");
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching users", error });
  }
};

// @desc    Create a new Staff User
// @route   POST /api/admin/users
// @access  Private (Admin/Lead Dev)
exports.createUser = async (req, res) => {
  try {
    const { 
      name, email, password, phone, role, bloodGroup, 
      address, city, location, 
      affiliatedHospital // <--- New Field
    } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Create User
    const user = await User.create({
      name,
      email,
      password, // Will be hashed by pre-save hook
      phone,
      role, 
      bloodGroup,
      
      // Location fields
      address, 
      city, 
      location,

      // Link Collector to Hospital (Only if role is collector)
      affiliatedHospital: role === 'collector' ? affiliatedHospital : null 
    });

    res.status(201).json({ success: true, message: "Staff created successfully", user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating user", error: error.message });
  }
};

// @desc    Update User (Role, Info)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin/Lead Dev)
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 1. Update Standard Fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.role = req.body.role || user.role;
    user.bloodGroup = req.body.bloodGroup || user.bloodGroup;

    // 2. Update Location Fields
    if (req.body.address !== undefined) user.address = req.body.address;
    if (req.body.city !== undefined) user.city = req.body.city;
    if (req.body.location !== undefined) user.location = req.body.location;

    // 3. Update Affiliated Hospital (NEW)
    // Checks if field is present in request (allows setting to null/empty)
    if (req.body.affiliatedHospital !== undefined) {
        user.affiliatedHospital = req.body.affiliatedHospital;
    }

    // 4. Update Password (Optional)
    if (req.body.password && req.body.password.trim() !== "") {
      user.password = req.body.password; 
    }

    // 5. Update Physical Stats (Optional)
    if (req.body.weight) user.weight = req.body.weight;
    if (req.body.dateOfBirth) user.dateOfBirth = req.body.dateOfBirth;

    await user.save(); 

    res.status(200).json({ success: true, message: "User updated successfully", user });
  } catch (error) {
    console.error("Admin Update Error:", error);
    res.status(500).json({ success: false, message: "Error updating user", error: error.message });
  }
};

// @desc    Delete User
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin/Lead Dev)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await user.deleteOne();
    res.status(200).json({ success: true, message: "User removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting user", error });
  }
};