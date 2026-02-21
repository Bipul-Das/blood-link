const Campaign = require("../models/Campaign");

// @desc    Create a new campaign
// @route   POST /api/campaigns
// @access  Admin
exports.createCampaign = async (req, res) => {
  try {
    const { title, description, date, location } = req.body;
    
    const campaign = await Campaign.create({
      title,
      description,
      date,
      location,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

// @desc    Get all upcoming campaigns
// @route   GET /api/campaigns
// @access  Private (Logged in users)
exports.getAllCampaigns = async (req, res) => {
  try {
    // Sort by date (soonest first)
    const campaigns = await Campaign.find({ date: { $gte: new Date() } }).sort({ date: 1 });
    res.status(200).json({ success: true, count: campaigns.length, data: campaigns });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

// @desc    Join a campaign
// @route   PUT /api/campaigns/:id/join
// @access  Private
exports.joinCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }

    // Check if already joined
    if (campaign.participants.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: "You have already joined this campaign" });
    }

    // Add user to participants array
    campaign.participants.push(req.user._id);
    await campaign.save();

    res.status(200).json({ success: true, message: "You have joined the campaign", data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};