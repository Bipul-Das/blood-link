const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Register a new user
exports.registerController = async (req, res) => {
  try {
    const { 
      name, email, password, phone, bloodGroup, role, 
      address, city, location, 
      dateOfBirth, weight 
    } = req.body;

    // 1. Manual Validation: Check for missing fields
    if (!address || !city || !location) {
        return res.status(400).json({ success: false, message: "Missing Address, City, or Area." });
    }

    // 2. Check Existing User
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ success: false, message: "Email already registered" });

    const phoneExists = await User.findOne({ phone });
    if (phoneExists) return res.status(400).json({ success: false, message: "Phone number already registered" });

    // 3. Create User
    const user = await User.create({
      name,
      email,
      password,
      phone,
      bloodGroup,
      role: role || "donor",
      address,   
      city,      
      location,  
      dateOfBirth,
      weight,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token: generateToken(user._id),
      user,
    });

  } catch (error) {
    // --- DEBUGGING: Print exact error to terminal ---
    console.error("REGISTER ERROR DETAILS:", error); 
    
    // --- Send exact error to Frontend ---
    res.status(500).json({ 
        success: false, 
        message: `Registration Failed: ${error.message}` 
    });
  }
};

// @desc    Login user
exports.loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Missing email/password" });

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid Password" });

    user.password = undefined;
    res.status(200).json({ success: true, token: generateToken(user._id), user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user
exports.currentUserController = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id });
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};