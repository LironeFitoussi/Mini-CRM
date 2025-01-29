/**
 * Donators Controller
 * 
 * This file contains all controller functions related to handling donors. 
 * It includes operations such as:
 * - Retrieving donors (with pagination and searching)
 * - Creating a new donor
 * - Updating an existing donor
 * - Deleting a donor
 * - Setting an owner for a single or multiple donors
 * - Bulk-creating donors from an Excel file
 * - Fetching total donors
 * - Fetching tasks related to a donor
 */

const Donation = require("../models/Donation.js");
const Donor = require("../models/Donor.js");

const parseDonations = require("../helpers/parseDonations.js");

const { z } = require("zod"); // Zod for validation
const excelToJson = require("convert-excel-to-json"); // Excel to JSON converter
const normalizePhoneNumber = require("../utils/libphonenumber.js");

/**
 * Capitalizes the first letter of a string.
 * @param {string} str - The input string to capitalize.
 * @returns {string} The capitalized string.
 */
const capitalize = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

/**
 * Splits and cleans a given string by multiple delimiters.
 * Removes empty strings in the process.
 * @param {string} str - The input string to split.
 * @param {string[]} delimiters - Array of delimiters to use for splitting.
 * @returns {string[]} An array of cleaned strings.
 */
const splitAndClean = (str, delimiters = ["\r\n", " "]) => {
  return str
    .split(new RegExp(delimiters.join("|"), "g"))
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
};

/**
 * Removes spaces, hyphens, parentheses, dots, and plus signs
 * from a phone number string for uniform formatting.
 * @param {string} phone - The original phone number string.
 * @returns {string} Formatted phone number.
 */
const formatPhoneNumber = (phone) => {
  return phone.replace(/[\s\-\(\)\.\+]/g, "");
};

/**
 * Retrieves all donors, with optional pagination and searching.
 * @param {Object} req - Express request object.
 * @param {Object} req.query - Query parameters (page, limit, search).
 * @param {Object} res - Express response object.
 */
exports.getAllDonators = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let filter = {};

    if (search && search.trim() !== "") {
      // Split the search string into individual terms
      const searchTerms = search.trim().split(/\s+/);

      // Create an array of $or conditions for each search term
      const andConditions = searchTerms.map((term) => {
        const searchRegex = new RegExp(term, "i");
        return {
          $or: [
            { fName: searchRegex },
            { lName: searchRegex },
            { email_1: searchRegex },
            { "phone_number_1.number": searchRegex },
            { "phone_number_2.number": searchRegex },
            { "phone_number_3.number": searchRegex },
          ],
        };
      });

      // Combine all conditions with $and
      filter = { $and: andConditions };
    }

    const donors = await Donor.find(filter)
      .skip(skip)
      .limit(limitNum)
      .populate("phone_number_1")
      .populate("phone_number_2")
      .populate("phone_number_3")
      .populate("owner")

    const totalDocuments = await Donor.countDocuments(filter);
    const totalPages = Math.ceil(totalDocuments / limitNum);

    res.status(200).json({
      currentPage: pageNum,
      totalPages,
      totalDocuments,
      donors,
    });
  } catch (error) {
    console.error("Error fetching donors:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "Failed to fetch donors", details: error.message });
  }
};

/**
 * Retrieves the total number of donors.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getTotalDonators = async (req, res) => {
  try {
    const totalDonators = await Donor.countDocuments();
    res.status(200).json(totalDonators);
  } catch (error) {
    console.error("Error fetching total donors:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Retrieves a single donor by its ID, including
 * associated phone numbers, donations, tasks, and notes.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getDonatorById = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id)
      .populate("phone_number_1")
      .populate("phone_number_2")
      .populate("phone_number_3")
      .populate({
        path: "donations",
        model: "Donation",
      })
      .populate("notes")
      .populate("owner");

    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    res.status(200).json(donor);
  } catch (error) {
    console.error("Error fetching donor by ID:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Creates a new donor, validating the input using Zod.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.createDonator = async (req, res) => {
  // Define a reusable phone number schema with error messages
  // Convert Date Strings to Date Objects if needed
  if (req.body.birthdate) {
    req.body.birthdate = new Date(req.body.birthdate);
  }

  // Zod sub-schemas
  const phoneNumberSchema = z.object({
    number: z
      .string()
      .min(6, { message: "Phone number must be at least 6 characters long" })
      .startsWith("+", { message: "Phone number must start with a '+'" }),
    country: z
      .string()
      .nonempty({ message: "Country is required for the phone number" }),
    is_whatsapp: z
      .enum(["true", "false", "unknown"], {
        message:
          "Invalid value for is_whatsapp. Accepted values are 'true', 'false', or 'unknown'",
      })
      .optional()
      .default("unknown"),
  });

  const emailSchema = z.object({
    email: z.string().email({ message: "Email must be a valid email address" }),
    isSubscribed: z.boolean().optional().default(true),
  });

  // Main donor schema
  const donatorSchema = z.object({
    fName: z.string().nonempty({ message: "First name is required" }),
    lName: z.string().nonempty({ message: "Last name is required" }),
    allo_dons_id: z.string().optional(),
    email_1: emailSchema,
    email_2: emailSchema.optional(),
    email_3: emailSchema.optional(),
    birthdate: z.date().optional(),
    phone_number_1: phoneNumberSchema,
    phone_number_2: phoneNumberSchema.optional(),
    phone_number_3: phoneNumberSchema.optional(),
  });

  try {
    // Parse and validate the input
    const validatedData = donatorSchema.parse(req.body);

    // Create a new donor object
    const donor = new Donor(validatedData);

    // Save to the database
    const newDonator = await donor.save();

    // Respond with the created donor
    res.status(201).json(newDonator);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Handle validation errors with detailed messages
      res.status(400).json({
        message: "Validation Error",
        errors: error.errors.map((err) => ({
          path: err.path,
          message: err.message,
        })),
      });
    } else {
      console.error("Error creating donor:", error.message);
      res.status(500).json({ message: error.message });
    }
  }
};

/**
 * Updates an existing donor by ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.updateDonator = async (req, res) => {
  try {
    const updatedDonator = await Donor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedDonator) {
      return res.status(404).json({ message: "Donor not found" });
    }
    res.status(200).json(updatedDonator);
  } catch (error) {
    console.error("Error updating donor:", error.message);
    res.status(400).json({ message: error.message });
  }
};

/**
 * Deletes a donor by ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.deleteDonator = async (req, res) => {
  try {
    const donor = await Donor.findByIdAndDelete(req.params.id);
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }
    res.status(200).json({ message: "Donor deleted" });
  } catch (error) {
    console.error("Error deleting donor:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Sets or updates the owner of a specific donor by ID.
 * @param {Object} req - Express request object.
 * @param {Object} req.body.owner - The new owner to assign.
 * @param {Object} res - Express response object.
 */
exports.setDonatorOwner = async (req, res) => {
  try {
    const donor = await Donor.findByIdAndUpdate(
      req.params.id,
      { owner: req.body.owner },
      { new: true }
    );
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }
    res.status(200).json(donor);
  } catch (error) {
    console.error("Error setting donor owner:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Updates the next contact date for a specific donor by ID.
 * @param {Object} req - Express request object.
 * @param {Object} req.body.nextContactDate - The new next contact date.
 * @param {Object} res - Express response object.
 */
exports.updateDonatorCallback = async (req, res) => {
  try {
    const donor = await Donor.findByIdAndUpdate(
      req.params.id,
      { nextContactDate: req.body.nextContactDate },
      { new: true }
    );
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }
    res.status(200).json(donor);
  } catch (error) {
    console.error("Error updating donor callback:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Bulk-create donors from an Excel file.
 * Expects `req.file` to contain the uploaded Excel file.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.bulkCreateDonators = async (req, res) => {
  try {
    // Validate uploaded file
    const excelFile = req.file;
    if (!excelFile) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    // Convert Excel file to JSON
    const excelData = excelToJson({ sourceFile: excelFile.path });
    const sheetData = excelData.Sheet1;
    if (!sheetData) {
      return res.status(400).json({ message: "Invalid Excel format." });
    }

    // Use Promise.all to handle asynchronous operations
    const contacts = await Promise.all(
      sheetData.map(async (row, index) => {
        const contact = {
          allo_dons_id: row.A || "",
          fullName: row.B || "",
          donations: row.D || "",
          email: row.E || "",
          phoneNumber: row.F || "",
        };

        // Split Full Name into fName and lName
        if (contact.fullName.includes(" ")) {
          const [fName, ...lNameParts] = contact.fullName.split(" ");
          contact.fName = capitalize(fName);
          contact.lName = capitalize(lNameParts.join(" "));
        } else {
          contact.fName = capitalize(contact.fullName);
          contact.lName = "";
        }
        delete contact.fullName;

        // Normalize Emails
        const emails = splitAndClean(contact.email);
        emails.forEach((email, emailIndex) => {
          contact[`email_${emailIndex + 1}`] = { email, isSubscribed: true };
        });
        delete contact.email;

        // Normalize Phone Numbers
        const phones = splitAndClean(contact.phoneNumber);
        let phoneIndex = 1;
        phones.forEach((phone) => {
          const formattedPhone = formatPhoneNumber(phone);
          if (formattedPhone.length < 6) {
            return; // Skip invalid numbers
          }

          const [number, country] = normalizePhoneNumber(formattedPhone);
          contact[`phone_number_${phoneIndex}`] = {
            number,
            country,
            is_whatsapp: "unknown",
            isSubscribed: true,
          };
          phoneIndex++;
        });
        delete contact.phoneNumber;

        // Save donor
        const donor = new Donor(contact);
        const savedDonator = await donor.save();

        // Process donations
        const donations = parseDonations(contact.donations, savedDonator._id);
        await Donation.insertMany(donations);

        return contact;
      })
    );

    res.status(200).json({ message: "Contacts processed successfully" });
  } catch (error) {
    console.error("Error processing contacts:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Assigns or updates the owner for multiple donors simultaneously.
 * Expects an array of donor IDs and a single owner in the request body.
 * 
 * @param {Object} req - Express request object
 * @param {string[]} req.body.donatorIds - Array of Donor IDs
 * @param {string} req.body.owner - The owner to assign
 * @param {Object} res - Express response object
 */
exports.setOwnersForMultipleDonators = async (req, res) => {
  try {
    const { donors, owner } = req.body;

    if (!Array.isArray(donors) || donors.length === 0 || !owner) {
      return res
        .status(400)
        .json({ message: "Invalid input data: missing donatorIds or owner" });
    }

    // Update all specified donors with the provided owner
    await Donor.updateMany(
      { _id: { $in: donors } },
      { $set: { owner } }
    );

    res.status(200).json({
      message: "Owner assigned to multiple donors successfully",
      donors,
      owner,
    });
  } catch (error) {
    console.error("Error assigning owner to multiple donors:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Assign Stauts to a specific donor by ID.
 * Expects a string of status in the request body, such as "To Contact", "No Response", etc.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.body.status - The status to assign
 * @param {Object} res - Express response object
 * @returns {Object} - The updated donor object
 */
exports.setDonatorStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Invalid input data: missing status" });
    }

    const donor = await Donor.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    res.status(200).json(donor);
  } catch (error) {
    console.error("Error assigning status to donor:", error.message);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * Get Total Donators which have nextContactDate
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - The total donors object
 */
exports.getTotalDonatorsWithCallback = async (req, res) => {
  try {
    const totalDonators = await Donor.find()

    const donatorsWithCallback = totalDonators.filter(donor => donor.nextContactDate)

    res.status(200).json(donatorsWithCallback.length);
  } catch (error) {
    console.error("Error fetching total donors with callback:", error.message);
    res.status(500).json({ message: error.message });
  }
}


/**
 * Check if a donor has a duplicate
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - The duplicate donor, if found
 */
exports.checkPotentialDuplicates = async (req, res) => {
  try {
    // Extract parameters (from query or body, your choice)
    // const {
    //   fName = '',
    //   lName = '',
    //   phone = '',
    //   email = '',
    // } = req.query; // or req.body if it's a POST

    const { id } = req.params;
    console.log('ID:', id);
    

    // Find the donor by ID
    const donor = await Donor.findById(id);

    if (!donor) { 
      return res.status(404).json({ message: 'Donor not found' });
    }

    console.log('Donor:', donor);
    
    const { fName, lName, phone_number_1: {number: phone}, email_1: {email} } = donor;

    // Normalize the input for searching:
    const combinedInput = (fName + lName).toLowerCase().replace(/\s+/g, '');
    const reversedInput = (lName + fName).toLowerCase().replace(/\s+/g, '');
    const last6 = phone.slice(-6); 
    const normalizedEmail = email.trim().toLowerCase();

    // Build the aggregation pipeline
    const pipeline = [
      // 1. Add combinedName, reversedName for each document
      {
        $addFields: {
          combinedName: {
            $replaceAll: {
              input: {
                $toLower: { $concat: ['$fName', '$lName'] }
              },
              find: ' ',
              replacement: ''
            }
          },
          reversedName: {
            $replaceAll: {
              input: {
                $toLower: { $concat: ['$lName', '$fName'] }
              },
              find: ' ',
              replacement: ''
            }
          }
        }
      },
      // 2. Match possible duplicates
      {
        $match: {
          $or: [
            // a) combinedName == (fName + lName)
            { combinedName: { $regex: '^' + combinedInput + '$', $options: 'i' } },
            // b) reversedName == (fName + lName)
            { reversedName: { $regex: '^' + reversedInput + '$', $options: 'i' } },
            // c) phone ends with last 6 digits
            { phone: { $regex: last6 + '$', $options: 'i' } },
            // d) email exact match (case-insensitive)
            { email: { $regex: '^' + normalizedEmail + '$', $options: 'i' } }
          ]
        }
      },
      // 3. Hide the helper fields from the final result
      {
        $project: {
          combinedName: 0,
          reversedName: 0,
        }
      }
    ];

    const potentialDuplicates = await Donor.aggregate(pipeline);

    res.status(200).json({
      status: 'success',
      count: potentialDuplicates.length,
      data: potentialDuplicates,
    });
  } catch (error) {
    console.error('Error checking potential duplicates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};