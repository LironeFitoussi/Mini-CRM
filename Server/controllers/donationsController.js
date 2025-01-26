const Donation = require("../models/Donation.js");
const axios = require("axios");
// Get all donations
const getAllDonations = async (req, res) => {
  // Extract query parameters with default values
  const {
    page = 1,
    limit = 10,
    sortField = "date", // Default sort field
    sortOrder = "asc", // Default sort order
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

  // Build the search filter
  let filter = {};

  if (search) {
    // Define fields to search through for strings
    const searchFields = ["type", "method"];
    const regex = new RegExp(search, "i");

    // Check if the search input is a valid date
    const parsedDate = new Date(search);
    const isValidDate = !isNaN(parsedDate.getTime());

    // Check if the search input is a valid number
    const parsedNumber = parseFloat(search);
    const isValidNumber = !isNaN(parsedNumber);

    // Construct the $or filter
    filter = {
      $or: [
        ...searchFields.map((field) => ({
          [field]: regex,
        })),
        ...(isValidDate
          ? [
              {
                date: {
                  $gte: new Date(parsedDate.setHours(0, 0, 0, 0)), // Start of the day
                  $lt: new Date(parsedDate.setHours(23, 59, 59, 999)), // End of the day
                },
              },
            ]
          : []),
        ...(isValidNumber
          ? [
              {
                amount: parsedNumber, // Exact match for the amount field
              },
            ]
          : []),
      ],
    };
  }

  /**
   * ---------------------------------------------------------------------
   *  YEAR FILTER LOGIC
   * ---------------------------------------------------------------------
   * If 'year' is passed as 'all', we skip filtering by year.
   * Otherwise, we filter donations that fall within that entire calendar year.
   * The default is the current year if not otherwise specified.
   */
  if (year.toString().toLowerCase() !== "all") {
    const numericYear = parseInt(year, 10);
    // Only apply if it's a valid number
    if (!isNaN(numericYear)) {
      const startOfYear = new Date(numericYear, 0, 1, 0, 0, 0, 0); // Jan 1, 00:00
      const endOfYear = new Date(numericYear, 11, 31, 23, 59, 59, 999); // Dec 31, 23:59:59.999

      // If the filter currently has an $or (from search), we wrap that in an $and
      // so that both the $or conditions and the year filter must be satisfied.
      if (filter.$or) {
        filter = {
          $and: [
            filter, // i.e., { $or: [...] }
            { date: { $gte: startOfYear, $lte: endOfYear } },
          ],
        };
      } else {
        // Otherwise, just add a direct date filter
        filter.date = {
          $gte: startOfYear,
          $lte: endOfYear,
        };
      }
    }
  }
  /**
   * ---------------------------------------------------------------------
   */

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
      totalDonations: count, // Useful for frontend pagination
    });
  } catch (error) {
    console.error("Error fetching donations:", error.message);
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

// Get all donation types
const getAllDonationTypes = async (req, res) => {
  const { year = new Date().getFullYear() } = req.query;

  // Build the year filter
  let filter = {};

  // If year is not "all", filter by that year
  if (year.toString().toLowerCase() !== "all") {
    const numericYear = parseInt(year, 10);
    if (!isNaN(numericYear)) {
      const startOfYear = new Date(numericYear, 0, 1, 0, 0, 0, 0);
      const endOfYear = new Date(numericYear, 11, 31, 23, 59, 59, 999);

      filter = {
        date: {
          $gte: startOfYear,
          $lte: endOfYear,
        },
      };
    }
  }

  try {
    // Fetch all donations (filtered by year if applicable)
    const allDonations = await Donation.find(filter);

    // Reduce the donations array to unique donation types with total amounts
    const donationSummary = allDonations.reduce((acc, donation) => {
      // Find if this type/currency already exists in the accumulator
      const existingType = acc.find(
        (item) =>
          item.type === donation.type && item.currency === donation.currency
      );

      if (existingType) {
        // If found, update the total amount
        existingType.totalAmount += donation.amount;
      } else {
        // Otherwise, add a new entry for this type
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
    console.error("Error fetching donation types:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Get Donations by Allodon ID
const getDonationsByAllodonId = async (req, res) => {
  try {
    const { id } = req.params;    
    const {
      data: { donations },
    } = await axios.get(`${process.env.ALLODON_URL}/donors/${id}`, {
      headers: { Authorization: `Bearer ${process.env.ALLODON_API_KEY}` },
    });

    res.status(200).json(donations);
  } catch (error) {
    console.error("Error fetching donations by donor ID:", error);
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
  getDonationsByAllodonId
};
