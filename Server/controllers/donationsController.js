const Donation = require("../models/Donation.js");

// Get all donations
const getAllDonations = async (req, res) => {
    // Extract query parameters with default values
    const {
      page = 1,
      limit = 10,
      sortField = 'date', // Default sort field
      sortOrder = 'asc',   // Default sort order
      search = '',         // Search query
    } = req.query;
  
    // Parse page and limit to integers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
  
    // Define allowed fields for sorting to prevent injection
    const allowedSortFields = [
      'donator_id',
      'amount',
      'date',
      'type',
      'method',
      'notes',
      'currency',
      'createdAt',
      'updatedAt',
    ];
  
    // Validate sortField
    const sortFieldValidated = allowedSortFields.includes(sortField)
      ? sortField
      : 'date'; // Fallback to default if invalid
  
    // Validate sortOrder
    const sortOrderValidated = sortOrder.toLowerCase() === 'desc' ? -1 : 1;
  
    // Build the sort object for Mongoose
    const sortOptions = {
      [sortFieldValidated]: sortOrderValidated,
    };
  
    // Build the search filter
    let filter = {};
    if (search) {
      // Define fields to search through
      const searchFields = ['donator_id', 'type', 'method', 'notes'];
  
      // Create a regex for case-insensitive partial matching
      const regex = new RegExp(search, 'i');
  
      // Construct the $or filter
      filter = {
        $or: searchFields.map((field) => ({
          [field]: regex,
        })),
      };
    }
  
    try {
      // Fetch donations with applied filters, sorting, and pagination
      const donations = await Donation.find(filter)
        .sort(sortOptions)
        .limit(limitNumber)
        .skip((pageNumber - 1) * limitNumber)
        .exec();
  
      // Count the total number of documents that match the filter
      const count = await Donation.countDocuments(filter);
  
      // Calculate total pages
      const totalPages = Math.ceil(count / limitNumber);
  
      // Respond with the paginated, sorted, and filtered donations
      res.status(200).json({
        donations,
        totalPages,
        currentPage: pageNumber,
        totalDonations: count, // Optional: Useful for frontend pagination
      });
    } catch (error) {
      console.error('Error fetching donations:', error.message);
      res.status(500).json({ message: error.message });
    }
  };
  

// Get donation by ID
const getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }
    res.status(200).json(donation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new donation
const createDonation = async (req, res) => {
  const donation = new Donation(req.body);
  try {
    const newDonation = await donation.save();
    res.status(201).json(newDonation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a donation
const updateDonation = async (req, res) => {
  try {
    const updatedDonation = await Donation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedDonation) {
      return res.status(404).json({ message: "Donation not found" });
    }
    res.status(200).json(updatedDonation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a donation
const deleteDonation = async (req, res) => {
  try {
    const deletedDonation = await Donation.findByIdAndDelete(req.params.id);
    if (!deletedDonation) {
      return res.status(404).json({ message: "Donation not found" });
    }
    res.status(200).json({ message: "Donation deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllDonationTypes = async (req, res) => {
  try {
    const allDonations = await Donation.find();

    // console.log(allDonations);

    // Reduce the array of donations to an array of objects with unique donation types and total amounts
    const donationSummary = allDonations.reduce((acc, donation) => {
      // Find the existing donation type in the accumulator
      const existingType = acc.find(
        (item) =>
          item.type === donation.type && item.currency === donation.currency
      );

      if (existingType) {
        // If found, update the total amount
        existingType.totalAmount += donation.amount;
      } else {
        // If not found, add a new entry for this type and currency
        acc.push({
          type: donation.type,
          totalAmount: donation.amount,
          currency: donation.currency,
        });
      }

      return acc;
    }, []);

    res.status(200).json(donationSummary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllDonations,
  getDonationById,
  createDonation,
  updateDonation,
  deleteDonation,
  getAllDonationTypes,
};
