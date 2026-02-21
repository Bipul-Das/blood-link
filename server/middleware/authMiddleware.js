const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 1. Protect Routes (Check for Token)
exports.protect = async (req, res, next) => {
  let token;

  // Check for Authorization header starting with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header (Bearer <token>)
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token payload (excluding password)
      req.user = await User.findById(decoded.id).select("-password");

      next(); // Move to the next middleware/controller
    } catch (error) {
      console.log(error);
      res.status(401).json({ success: false, message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: "Not authorized, no token" });
  }
};

// 2. Role-Based Access Control (RBAC)
// Usage: authorize('admin', 'lead_dev')
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};