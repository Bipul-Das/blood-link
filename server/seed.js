const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const connectDB = require("./config/db");

// Load env vars
dotenv.config();

// Connect to DB
connectDB();

const importData = async () => {
  try {
    // 1. Define the Lead Developer Account
    const leadDev = {
      name: "Lead Developer",
      email: "dev1@bloodlink.com", // You will use this to login
      password: "d", // Default password
      phone: "0000000000",
      role: "lead_dev", // THE GOD ROLE
      bloodGroup: "O+",
      location: "Dhaka",
        address: "Server Room 1",
        city: "Cloud City"
      
    };

    // 2. Check if exists
    const userExists = await User.findOne({ email: leadDev.email });
    
    if (userExists) {
      console.log("\x1b[33m%s\x1b[0m", "⚠️  Lead Developer already exists!");
      process.exit();
    }

    // 3. Create User (This triggers the pre-save hooks for ID and Password Hashing)
    await User.create(leadDev);

    console.log("\x1b[32m%s\x1b[0m", "✅ Lead Developer Account Created Successfully!");
    console.log("📧 Email: dev1@bloodlink.com");
    console.log("🔑 Password: d");
    
    process.exit();
  } catch (error) {
    console.error("\x1b[31m%s\x1b[0m", `❌ Error: ${error.message}`);
    process.exit(1);
  }
};

importData();