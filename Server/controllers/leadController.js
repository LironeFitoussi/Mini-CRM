// controllers/leadController.js
const LeadList = require("../models/LeadList");
const LeadCard = require("../models/LeadCard");
const Notification = require("../models/Notification");

// @desc    Create a new lead
// @route   POST /api/leads
// @access  Private
const createLead = async (req, res, next) => {
  try {
    const { title, description, owner, donators, metadata } = req.body;

    const lead = new LeadList({
      title,
      description,
      user: owner, // Assign the owner's ID
      metadata,
    });

    const savedLead = await lead.save();

    // Create lead cards for each donator
    const leadCards = donators.map((donator) => ({
      leadList: savedLead._id,
      donatorEntryId: donator.donatorId,
    }));

    await LeadCard.insertMany(leadCards);

    res.status(201).json(savedLead);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private
// controllers/leadsController.js
const getAllLeads = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query; // Optional pagination

    // Build the query object
    const query = {};

    if (search) {
      // Use a case-insensitive regular expression for partial matching on the 'name' field
      query.name = { $regex: search, $options: "i" };
    }

    // Calculate pagination values
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const parsedLimit = parseInt(limit) > 100 ? 100 : parseInt(limit); // Cap the limit to prevent excessive data

    // Execute the query with filters and pagination
    const leads = await LeadList.find(query)
      // .populate("leadCards")
      .skip(skip)
      .limit(parsedLimit)
      .select("-__v -createdAt -updatedAt -id")
      .exec();

    // Optionally, get the total count for pagination purposes
    const totalLeads = await LeadList.countDocuments(query).exec();

    res.status(200).json({
      data: leads,
      meta: {
        total: totalLeads,
        page: parseInt(page),
        limit: parsedLimit,
        totalPages: Math.ceil(totalLeads / parsedLimit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single lead by ID
// @route   GET /api/leads/:id
// @access  Private
const getLeadById = async (req, res, next) => {
  try {
    const lead = await LeadList.findById(req.params.id)
      .populate("leadCards")

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.status(200).json(lead);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a lead by ID
// @route   PUT /api/leads/:id
// @access  Private
const updateLead = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    const updatedLead = await LeadList.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true, runValidators: true }
    );

    if (!updatedLead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.status(200).json(updatedLead);
  } catch (error) {
    next(error);
  }
};

// @desc    Set Call Back Date for a lead
// @route   POST /api/v1/leads/:leadCardId
// @access  Private
const setCallBackDate = async (req, res,) => {
  try {
    const { nextContactDate } = req.body;

    const leadCard = await LeadCard.findById(req.params.leadCardId);

    if (!leadCard) {
      return res.status(404).json({ message: "Lead not found" });
    }

    leadCard.nextContactDate = nextContactDate;

    await leadCard.save();

    const leadList = await LeadList.findById(leadCard.leadList);

    const notification = new Notification({
      title: "Call Back",
      type: "callback",
      userId: leadList.user,
      donatorId: leadCard.donatorEntryId,
      notificationDate: nextContactDate,
    });

    await notification.save();

    res.status(200).json(leadCard);
  } catch (error) {
    res.status(500).json({ message: "Failed to set call back date" });
  }
};

// @desc    Toggle a lead's status by ID
// @route   PUT /api/leads/:id/toggle-status
// @access  Private
const changeLeadStatus = async (req, res) => {
  try {
    const { status } = req.body;

    console.log("Status", status);

    const lead = await LeadCard.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Update the status
    lead.status = status;

    // Save the updated lead
    await lead.save();

    console.log("Lead", lead);
    
    res.status(200).json(lead);
  } catch (error) {
    res.status(500).json({ message: "Failed to update lead status", error: error.message });
  }
};

// @desc    Delete a lead by ID
// @route   DELETE /api/leads/:id
// @access  Private
const deleteLead = async (req, res, next) => {
  try {
    const lead = await LeadList.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.status(200).json({ message: "Lead deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a donator to a lead
// @route   POST /api/leads/:id/donators
// @access  Private
const addDonator = async (req, res, next) => {
  try {
    // Get Lead ID from the URL
    const { id } = req.params;

    // Get the donator IDs from the request body
    const { donorIds } = req.body;

    // Crate a new LeadCard for each donator
    const leadCards = donorIds.map((donatorId) => ({
      leadList: id,
      donatorEntryId: donatorId,
    }));

    // Insert the new LeadCards
    const leads = await LeadCard.insertMany(leadCards);


    res.status(201).json(leads);
  } catch (error) {
    next(error);
  }
};

// @desc    Update donator status in a lead
// @route   PUT /api/leads/:id/donators/:donatorId
// @access  Private
const updateDonatorStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { id, donatorId } = req.params;

    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const donator = lead.donators.find(
      (d) => d.donatorId.toString() === donatorId
    );

    if (!donator) {
      return res
        .status(404)
        .json({ message: "Donator not found in this lead" });
    }

    donator.status = status;
    const updatedLead = await lead.save();

    res.status(200).json(updatedLead);
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a donator from a lead
// @route   DELETE /api/leads/:id/donators/:donatorId
// @access  Private
const removeDonator = async (req, res, next) => {
  try {
    const { id, donatorId } = req.params;

    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const donatorIndex = lead.donators.findIndex(
      (d) => d.donatorId.toString() === donatorId
    );

    if (donatorIndex === -1) {
      return res
        .status(404)
        .json({ message: "Donator not found in this lead" });
    }

    lead.donators.splice(donatorIndex, 1);
    await lead.save();

    res.status(200).json({ message: "Donator removed successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllLeads,
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
  addDonator,
  updateDonatorStatus,
  removeDonator,
  changeLeadStatus,
  setCallBackDate
};
