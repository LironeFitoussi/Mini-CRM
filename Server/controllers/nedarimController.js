/**
 * Nedarim Controller
 * 
 * This file contains controller functions for handling Nedarim-specific data.
 * It includes operations such as:
 * - Retrieving all donations from the Nedarim platform
 * - Retrieving all donors associated with the Nedarim platform
 */

const Donation = require("../models/Donation.js");
const Donor = require("../models/Donor.js");

/**
 * Retrieves all donations from the Nedarim platform with pagination, sorting, and filtering.
 * @param {Object} req - Express request object.
 * @param {Object} req.query - Query parameters (page, limit, sortField, sortOrder, search, year).
 * @param {Object} res - Express response object.
 */
exports.getNedarimDonations = async (req, res) => {
  try {
    // Extract query parameters with default values
    const {
      page = 1,
      limit = 10,
      sortField = "date",  // Default sort field
      sortOrder = "asc",   // Default sort order
      search = "",
      year = new Date().getFullYear(), // Default year to current if not specified
    } = req.query;

    // Parse page and limit to integers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Define allowed fields for sorting to prevent injection
    const allowedSortFields = [
      "donator_id",
      "amount",
      "date",
      "type",
      "method",
      "notes",
      "currency",
      "createdAt",
      "updatedAt",
    ];

    // Validate sortField
    const sortFieldValidated = allowedSortFields.includes(sortField)
      ? sortField
      : "date"; // Fallback to default if invalid

    // Validate sortOrder
    const sortOrderValidated = sortOrder.toLowerCase() === "desc" ? -1 : 1;

    // Build the sort object for Mongoose
    const sortOptions = {
      [sortFieldValidated]: sortOrderValidated,
    };

    // Build the filter - specifically for Nedarim platform
    let filter = { platform: "nedarim" };

    // Add search functionality if provided
    if (search) {
      // Define fields to search through for strings
      const searchFields = ["type", "method", "notes"];
      
      // Search for numeric values if search is a number
      const isNumeric = !isNaN(parseFloat(search)) && isFinite(search);
      if (isNumeric) {
        const numericFields = ["amount", "euro_amount"];
        filter.$or = [
          ...searchFields.map(field => ({ [field]: { $regex: search, $options: "i" } })),
          ...numericFields.map(field => ({ [field]: parseFloat(search) }))
        ];
      } else {
        // Text search for non-numeric values
        filter.$or = searchFields.map(field => ({ 
          [field]: { $regex: search, $options: "i" } 
        }));
      }
    }

    // Add year filter if provided
    if (year) {
      const yearStart = new Date(`${year}-01-01T00:00:00.000Z`);
      const yearEnd = new Date(`${year}-12-31T23:59:59.999Z`);
      filter.date = { $gte: yearStart, $lte: yearEnd };
    }

    // Execute the query with pagination
    const donations = await Donation.find(filter)
      .sort(sortOptions)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .populate("donator_id", "fName lName")
      .exec();

    // Get total count of matching documents for pagination info
    const totalDonations = await Donation.countDocuments(filter);

    // Return the paginated results
    res.status(200).json({
      donations,
      totalPages: Math.ceil(totalDonations / limitNumber),
      currentPage: pageNumber,
      totalItems: totalDonations,
    });
  } catch (error) {
    console.error("Error fetching Nedarim donations:", error);
    res.status(500).json({
      error: "An error occurred while retrieving Nedarim donations",
      details: error.message,
    });
  }
};

/**
 * Retrieves all donors associated with the Nedarim platform.
 * @param {Object} req - Express request object.
 * @param {Object} req.query - Query parameters (page, limit, search).
 * @param {Object} res - Express response object.
 */
exports.getNedarimDonors = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Create a filter for donors with 'nedarim' in their platform_type array
    let filter = { platform_type: "nedarim" };

    // Add search functionality if provided
    if (search) {
      const searchRegex = new RegExp(search, "i");
      filter.$or = [
        { fName: searchRegex },
        { lName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { address: searchRegex },
        { city: searchRegex },
        { country: searchRegex }
      ];
    }

    // Execute the query with pagination
    const donors = await Donor.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("owner", "name email")
      .exec();

    // Get total count for pagination info
    const totalDonors = await Donor.countDocuments(filter);

    // Return the paginated results
    res.status(200).json({
      donors,
      totalPages: Math.ceil(totalDonors / limitNum),
      currentPage: pageNum,
      totalItems: totalDonors,
    });
  } catch (error) {
    console.error("Error fetching Nedarim donors:", error);
    res.status(500).json({
      error: "An error occurred while retrieving Nedarim donors",
      details: error.message,
    });
  }
};

/**
 * Gets summary statistics for Nedarim donations and donors.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getNedarimStats = async (req, res) => {
  try {
    // Get the current year for default filtering
    const currentYear = new Date().getFullYear();
    const { year = currentYear } = req.query;
    
    const yearStart = new Date(`${year}-01-01T00:00:00.000Z`);
    const yearEnd = new Date(`${year}-12-31T23:59:59.999Z`);

    // Count total Nedarim donors
    const totalDonors = await Donor.countDocuments({ platform_type: "nedarim" });

    // Count total Nedarim donations
    const totalDonations = await Donation.countDocuments({ platform: "nedarim" });
    
    // Count Nedarim donations for the specified year
    const yearlyDonations = await Donation.countDocuments({ 
      platform: "nedarim",
      date: { $gte: yearStart, $lte: yearEnd }
    });

    // Calculate total donation amount for Nedarim
    const donationAmounts = await Donation.aggregate([
      { $match: { platform: "nedarim" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    
    // Calculate yearly donation amount for Nedarim
    const yearlyAmounts = await Donation.aggregate([
      { 
        $match: { 
          platform: "nedarim",
          date: { $gte: yearStart, $lte: yearEnd }
        } 
      },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalAmount = donationAmounts.length > 0 ? donationAmounts[0].total : 0;
    const yearlyAmount = yearlyAmounts.length > 0 ? yearlyAmounts[0].total : 0;

    res.status(200).json({
      totalDonors,
      totalDonations,
      yearlyDonations,
      totalAmount,
      yearlyAmount,
      year
    });
  } catch (error) {
    console.error("Error fetching Nedarim statistics:", error);
    res.status(500).json({
      error: "An error occurred while retrieving Nedarim statistics",
      details: error.message,
    });
  }
}; 