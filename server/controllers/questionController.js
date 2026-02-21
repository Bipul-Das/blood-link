const Question = require("../models/Question");

// @desc    Ask a question (Donors/Users)
// @route   POST /api/questions
exports.askQuestion = async (req, res) => {
  try {
    const { text } = req.body;
    const q = await Question.create({
      text,
      askedBy: req.user._id,
    });
    res.status(201).json({ success: true, data: q });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get Public Q&A Feed (Answered questions visible to all)
// @route   GET /api/questions/public
exports.getPublicQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ status: "answered" })
      .populate("askedBy", "name")
      .populate("answeredBy", "name")
      .sort({ updatedAt: -1 }); // Newest answers first
    res.status(200).json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get Pending Questions (For Volunteers)
// @route   GET /api/questions/pending
exports.getPendingQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ status: "pending" })
      .populate("askedBy", "name bloodGroup")
      .sort({ createdAt: 1 }); // Oldest first (FIFO)
    res.status(200).json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Answer a Question (Volunteer Only)
// @route   PUT /api/questions/:id/answer
exports.answerQuestion = async (req, res) => {
  try {
    const { answer } = req.body;
    const question = await Question.findById(req.params.id);

    if (!question) return res.status(404).json({ message: "Not found" });
    
    // LOCK: Check if already answered
    if (question.status === "answered") {
        return res.status(400).json({ message: "This question is already locked/answered." });
    }

    question.answer = answer;
    question.answeredBy = req.user._id;
    question.status = "answered";
    await question.save();

    res.status(200).json({ success: true, message: "Answer posted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};