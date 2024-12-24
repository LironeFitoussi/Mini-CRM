const Donation = require("../models/Donation.js");
const Donator = require("../models/Donator.js");
const Task = require("../models/Task.js");
const parseDonations = require("../helpers/parseDonations.js");

// Zod Validation
const { z, bigint } = require("zod");

// Import EXCEL to JSON converter
const excelToJson = require("convert-excel-to-json");
const normalizePhoneNumber = require("../utils/libphonenumber.js");

// Helper to capitalize strings
const capitalize = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

// Helper to clean and split strings by multiple delimiters
const splitAndClean = (str, delimiters = ["\r\n", " "]) => {
  return str
    .split(new RegExp(delimiters.join("|"), "g"))
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
};

// Helper to format phone numbers
const formatPhoneNumber = (phone) => {
  return phone.replace(/[\s\-\(\)\.\+]/g, "");
};

// Get all donators
exports.getAllDonators = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let filter = {};

    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      filter = {
        $or: [
          { fName: searchRegex },
          { lName: searchRegex },
          { email_1: searchRegex },
          { "phone_number_1.number": searchRegex },
          { "phone_number_2.number": searchRegex },
          { "phone_number_3.number": searchRegex },
        ],
      };
    }

    const donators = await Donator.find(filter)
      .skip(skip)
      .limit(limitNum)
      .populate("phone_number_1")
      .populate("phone_number_2")
      .populate("phone_number_3");

    const totalDocuments = await Donator.countDocuments(filter);
    const totalPages = Math.ceil(totalDocuments / limitNum);

    res.status(200).json({
      currentPage: pageNum,
      totalPages,
      totalDocuments,
      donators,
    });
  } catch (error) {
    console.error("Error fetching donators:", {
      message: error.message,
      stack: error.stack,
    });

    res
      .status(500)
      .json({ error: "Failed to fetch donators", details: error.message });
  }
};

// Get Total Donators
exports.getTotalDonators = async (req, res) => {
  try {
    const totalDonators = await Donator.countDocuments();
    res.status(200).json(totalDonators);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single donator by ID
exports.getDonatorById = async (req, res) => {
  try {
    // Get Donator by ID and populate phone numbers and associated donations from donations collection
    const donator = await Donator.findById(req.params.id)
      .populate("phone_number_1")
      .populate("phone_number_2")
      .populate("phone_number_3")
      .populate({
        path: "donations",
        model: "Donation",
      })
      .populate({
        path: "tasks",
        model: "Task",
        // Select only the fields we need
        select: "title description due_date status",
      });

    if (!donator) {
      return res.status(404).json({ message: "Donator not found" });
    }
    res.status(200).json(donator);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new donator
exports.createDonator = async (req, res) => {
  // Define a reusable phone number schema with error messages
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
        message: "Invalid value for is_whatsapp. Accepted values are 'true', 'false', or 'unknown'",
      })
      .optional()
      .default("unknown"),
  });

  // Validate request body with error messages
  const donatorSchema = z.object({
    fName: z.string().nonempty({ message: "First name is required" }),
    lName: z.string().nonempty({ message: "Last name is required" }),
    allo_dons_id: z.string().optional(),
    email_1: z
      .string()
      .email({ message: "Email 1 must be a valid email address" })
      .optional(),
    email_2: z
      .string()
      .email({ message: "Email 2 must be a valid email address" })
      .optional(),
    email_3: z
      .string()
      .email({ message: "Email 3 must be a valid email address" })
      .optional(),
    birthdate: z.date().optional(),
    phone_number_1: phoneNumberSchema,
    phone_number_2: phoneNumberSchema.optional(),
    phone_number_3: phoneNumberSchema.optional(),
  });

  try {
    // Parse and validate the input
    const validatedData = donatorSchema.parse(req.body);

    // Create a new donator object
    const donator = new Donator(validatedData);

    // Save to database
    const newDonator = await donator.save();

    // Respond with the created donator
    res.status(201).json(newDonator);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Handle validation errors and provide detailed error messages
      res.status(400).json({
        message: "Validation Error",
        errors: error.errors.map((err) => ({
          path: err.path,
          message: err.message,
        })),
      });
    } else {
      // Handle other errors
      res.status(500).json({ message: error.message });
    }
  }
};

// Update an existing donator
exports.updateDonator = async (req, res) => {
  try {
    const updatedDonator = await Donator.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedDonator) {
      return res.status(404).json({ message: "Donator not found" });
    }
    res.status(200).json(updatedDonator);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a donator
exports.deleteDonator = async (req, res) => {
  try {
    const donator = await Donator.findByIdAndDelete(req.params.id);
    if (!donator) {
      return res.status(404).json({ message: "Donator not found" });
    }
    res.status(200).json({ message: "Donator deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.bulkCreateDonators = async (req, res) => {
  try {
    // Validate uploaded file
    const excelFile = req.file;
    if (!excelFile) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    // console.log("Excel file:", excelFile);

    // Convert Excel file to JSON
    const excelData = excelToJson({ sourceFile: excelFile.path });
    const sheetData = excelData.Sheet1;
    if (!sheetData) {
      return res.status(400).json({ message: "Invalid Excel format." });
    }

    // Use Promise.all to handle asynchronous operations
    const contacts = await Promise.all(
      sheetData.map(async (row, index) => {
        let contact = {
          allo_dons_id: row.A || "", // Ensure it's a string
          fullName: row.B || "",
          email: row.E || "",
          phoneNumber: row.F || "",
          donations: row.D || "",
        };

        // Split Full Name
        if (contact.fullName.includes(" ")) {
          const [fName, ...lNameParts] = contact.fullName.split(" ");
          const lName = lNameParts.join(" ");
          contact.fName = capitalize(fName);
          contact.lName = capitalize(lName.split(/[\n\r]/)[0]);
        } else {
          contact.fName = capitalize(contact.fullName);
          contact.lName = "";
        }
        delete contact.fullName;

        // Normalize Emails
        const emails = splitAndClean(contact.email);
        emails.forEach((email, emailIndex) => {
          contact[`email_${emailIndex + 1}`] = email;
        });
        delete contact.email;

        // Normalize Phone Numbers (Ensure Nested Schema Compliance)
        const phones = splitAndClean(contact.phoneNumber);
        let phoneIndex = 1;
        phones.forEach((phone) => {
          const formattedPhone = formatPhoneNumber(phone);
          if (formattedPhone.length < 6) {
            // console.log(`Row ${index + 1}: Invalid phone number skipped: ${formattedPhone}`);
            return; // Skip invalid numbers
          }

          const [number, country] = normalizePhoneNumber(formattedPhone);
          // Create phone object matching phoneSchema
          contact[`phone_number_${phoneIndex}`] = {
            number,
            country, // Update as needed
            is_whatsapp: "unknown", // Ensure it's a string
          };
          phoneIndex++;
        });
        delete contact.phoneNumber;

        // console.log(`Row ${index + 1}: Contact before saving:`, contact);

        const donator = new Donator(contact);
        let savedDonator;
        try {
          savedDonator = await donator.save();
          // console.log(`Row ${index + 1}: Saved Donator:`, savedDonator);
        } catch (saveError) {
          console.error(`Row ${index + 1}: Error saving Donator:`, saveError);
          throw saveError; // Propagate the error to be caught by the outer catch
        }

        // Process Donations
        const donations = parseDonations(contact.donations, savedDonator._id);

        // Save donations to the database
        await Donation.insertMany(donations);

        return contact;
      })
    );

    // console.log("Processed Contacts:", contacts);

    res.status(200).json({ message: "Contacts processed successfully" });
  } catch (error) {
    console.error("Error processing contacts:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get Tasks for Donator
exports.getDonatorTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ donator: req.params.id });
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error.message);
    res.status(500).json({ message: error.message });
  }
};
