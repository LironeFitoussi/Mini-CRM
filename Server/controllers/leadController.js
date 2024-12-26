// controllers/leadController.js
const Lead = require('../models/Lead');

// @desc    Create a new lead
// @route   POST /api/leads
// @access  Private
const createLead = async (req, res, next) => {
  try {
    const { title, description, owner, donators, metadata } = req.body;

    const lead = new Lead({
      title,
      description,
      owner,
      donators,
      metadata,
    });

    const savedLead = await lead.save();
    res.status(201).json(savedLead);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private
const getAllLeads = async (req, res, next) => {
  try {
    const leads = await Lead.find()
      .populate('owner', 'name email') // Adjust fields as necessary
      .populate('donators.donatorId', 'name contact'); // Adjust fields as necessary
    res.status(200).json(leads);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single lead by ID
// @route   GET /api/leads/:id
// @access  Private
const getLeadById = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('donators.donatorId', 'name contact');

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
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
    const { title, description, donators, metadata } = req.body;

    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      { title, description, donators, metadata },
      { new: true, runValidators: true }
    );

    if (!updatedLead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.status(200).json(updatedLead);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a lead by ID
// @route   DELETE /api/leads/:id
// @access  Private
const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.status(200).json({ message: 'Lead deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a donator to a lead
// @route   POST /api/leads/:id/donators
// @access  Private
const addDonator = async (req, res, next) => {
  try {
    const { donatorId, status } = req.body;

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    lead.donators.push({ donatorId, status });
    const updatedLead = await lead.save();

    res.status(201).json(updatedLead);
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
      return res.status(404).json({ message: 'Lead not found' });
    }

    const donator = lead.donators.find(d => d.donatorId.toString() === donatorId);

    if (!donator) {
      return res.status(404).json({ message: 'Donator not found in this lead' });
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
      return res.status(404).json({ message: 'Lead not found' });
    }

    const donatorIndex = lead.donators.findIndex(d => d.donatorId.toString() === donatorId);

    if (donatorIndex === -1) {
      return res.status(404).json({ message: 'Donator not found in this lead' });
    }

    lead.donators.splice(donatorIndex, 1);
    await lead.save();

    res.status(200).json({ message: 'Donator removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
  addDonator,
  updateDonatorStatus,
  removeDonator,
};
