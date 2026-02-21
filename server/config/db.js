const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Attempt to connect to the database
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // Success Log with Color (Cyan & Bold for visibility)
    console.log(
      `\x1b[36m%s\x1b[0m`, // ANSI Cyan Color Code
      `✅ MongoDB Connected: ${conn.connection.host}`
    );
  } catch (error) {
    // Error Log with Color (Red & Bold)
    console.error(
      `\x1b[31m%s\x1b[0m`, // ANSI Red Color Code
      `❌ Error: ${error.message}`
    );
    
    // Exit process with failure code (1)
    // This stops the server from running in a broken state
    process.exit(1);
  }
};

module.exports = connectDB;