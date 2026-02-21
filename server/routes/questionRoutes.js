const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { 
    askQuestion, 
    getPublicQuestions, 
    getPendingQuestions, 
    answerQuestion 
} = require("../controllers/questionController");

// Public (Logged in users can ask/view)
router.post("/", protect, askQuestion);
router.get("/public", getPublicQuestions); // Anyone can see answers

// Volunteer Only
router.get("/pending", protect, authorize("volunteer", "admin", "lead_dev"), getPendingQuestions);
router.put("/:id/answer", protect, authorize("volunteer", "admin", "lead_dev"), answerQuestion);

module.exports = router;