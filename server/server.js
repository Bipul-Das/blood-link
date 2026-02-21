const express = require("express");
const dotenv = require("dotenv");
const colors = require("colors");
const morgan = require("morgan");
const cors = require("cors");
const connectDB = require("./config/db");

// IMPORT THE NEW MIDDLEWARE
const sanitizeInput = require("./middleware/sanitizeInput");
const campaignRoutes = require("./routes/campaignRoutes");
const collectionRoutes = require("./routes/collectionRoutes");
const questionRoutes = require("./routes/questionRoutes");
const userRoutes = require("./routes/userRoutes"); // <--- IMPORT USER ROUTES

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json()); 
app.use(cors());
app.use(morgan("dev"));

// --- ROUTE DEFINITIONS ---
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", userRoutes); // <--- ADD THIS LINE (Fixes 404 Error)
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/donations", require("./routes/donationRoutes"));
app.use("/api/requests", require("./routes/requestRoutes"));
// app.use("/api/campaigns", require("./routes/campaignRoutes")); // Removed duplicate
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));
app.use("/api/campaigns", campaignRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/public", require("./routes/publicRoutes"));

// APPLY SANITIZATION HERE
app.use(sanitizeInput); 

// Test Route
app.post("/test-sanitize", (req, res) => {
  res.json({
    message: "Data Received",
    receivedData: req.body,
  });
});

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(
    `\x1b[33m%s\x1b[0m`,
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
});