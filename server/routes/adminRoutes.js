const express = require("express");
const { getAllUsers, createUser, updateUser, deleteUser } = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Apply protection to all routes in this file
router.use(protect);
router.use(authorize("admin", "lead_dev"));

router.route("/users")
  .get(getAllUsers)
  .post(createUser);

router.route("/users/:id")
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;