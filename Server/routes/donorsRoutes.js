/**
 * Donators Routes
 *
 * This router handles all routes related to donors, including:
 * - Creating new donors
 * - Retrieving existing donors or lists of donors
 * - Updating donors
 * - Deleting donors
 * - Bulk-creating donors from an uploaded file
 * - Retrieving the total count of donors
 * - Associating tasks or owners with donors
 */

const express = require("express");
const multer = require("multer");

const router = express.Router();

// Configure Multer for file uploads (stored in /uploads directory)
const upload = multer({ dest: "uploads/" });

// Import the controller functions
const {
  getAllDonators,
  getDonatorById,
  createDonator,
  updateDonator,
  deleteDonator,
  bulkCreateDonators,
  getTotalDonators,
  getDonatorTasks,
  setDonatorOwner,
  setOwnersForMultipleDonators,
  setDonatorStatus,
  updateDonatorCallback,
  getTotalDonatorsWithCallback
} = require("../controllers/donorsController");

/**
 * @route   GET /donors
 * @desc    Retrieve all donors
 * @access  Public
 */
router.get("/", getAllDonators);

/**
 * @route   GET /donors/total
 * @desc    Retrieve the total number of donors
 * @access  Public
 */
router.get("/total", getTotalDonators);

/**
 * @route   GET /donors/total-callback
 * @desc    Retrieve the total number of donors with callback dates
 * @access  Public
 * @returns {Number} The total number of donors with callback dates
 */
router.get("/total-callback", getTotalDonatorsWithCallback); 

/**
 * @route   PUT /donors/assign
 * @desc    Assign an owner to multiple donors at once
 * @access  Public
 */
router.put("/assign", setOwnersForMultipleDonators);

/**
 * @route   PUT /donors/:id/owner
 * @desc    Set or update the owner of a specific donator
 * @access  Public
 */
router.put("/:id/owner", setDonatorOwner);

/**
 * @route   PUT /donors/:id/status
 * @desc    Update the status of a specific donator
 * @access  Public
 */
router.put("/:id/status", setDonatorStatus);

/**
 * @route   PUT /donors/:id/callback
 * @desc    Update the next contact date for a specific donator
 * @access  Public
 */
router.put("/:id/callback", updateDonatorCallback);

/**
 * @route   GET /donors/:id
 * @desc    Retrieve a donator by ID
 * @access  Public
 */
router.get("/:id", getDonatorById);

/**
 * @route   POST /donors
 * @desc    Create a new donator
 * @access  Public
 */
router.post("/", createDonator);

/**
 * @route   PUT /donors/:id
 * @desc    Update an existing donator by ID
 * @access  Public
 */
router.put("/:id", updateDonator);

/**
 * @route   DELETE /donors/:id
 * @desc    Delete a donator by ID
 * @access  Public
 */
router.delete("/:id", deleteDonator);

/**
 * @route   POST /donors/bulk-create
 * @desc    Bulk-create donors from an uploaded file
 * @access  Public
 */
router.post("/bulk-create", upload.single("file"), bulkCreateDonators);



module.exports = router;
