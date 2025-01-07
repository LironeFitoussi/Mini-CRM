/**
 * Donators Routes
 *
 * This router handles all routes related to donators, including:
 * - Creating new donators
 * - Retrieving existing donators or lists of donators
 * - Updating donators
 * - Deleting donators
 * - Bulk-creating donators from an uploaded file
 * - Retrieving the total count of donators
 * - Associating tasks or owners with donators
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
} = require("../controllers/donatorsController");

/**
 * @route   GET /donators
 * @desc    Retrieve all donators
 * @access  Public
 */
router.get("/", getAllDonators);

/**
 * @route   GET /donators/total
 * @desc    Retrieve the total number of donators
 * @access  Public
 */
router.get("/total", getTotalDonators);

/**
 * @route   GET /donators/total-callback
 * @desc    Retrieve the total number of donators with callback dates
 * @access  Public
 * @returns {Number} The total number of donators with callback dates
 */
router.get("/total-callback", getTotalDonatorsWithCallback); 

/**
 * @route   PUT /donators/assign
 * @desc    Assign an owner to multiple donators at once
 * @access  Public
 */
router.put("/assign", setOwnersForMultipleDonators);

/**
 * @route   GET /donators/:id/tasks
 * @desc    Retrieve all tasks associated with a specific donator
 * @access  Public
 */
router.get("/:id/tasks", getDonatorTasks);

/**
 * @route   PUT /donators/:id/owner
 * @desc    Set or update the owner of a specific donator
 * @access  Public
 */
router.put("/:id/owner", setDonatorOwner);

/**
 * @route   PUT /donators/:id/status
 * @desc    Update the status of a specific donator
 * @access  Public
 */
router.put("/:id/status", setDonatorStatus);

/**
 * @route   PUT /donators/:id/callback
 * @desc    Update the next contact date for a specific donator
 * @access  Public
 */
router.put("/:id/callback", updateDonatorCallback);

/**
 * @route   GET /donators/:id
 * @desc    Retrieve a donator by ID
 * @access  Public
 */
router.get("/:id", getDonatorById);

/**
 * @route   POST /donators
 * @desc    Create a new donator
 * @access  Public
 */
router.post("/", createDonator);

/**
 * @route   PUT /donators/:id
 * @desc    Update an existing donator by ID
 * @access  Public
 */
router.put("/:id", updateDonator);

/**
 * @route   DELETE /donators/:id
 * @desc    Delete a donator by ID
 * @access  Public
 */
router.delete("/:id", deleteDonator);

/**
 * @route   POST /donators/bulk-create
 * @desc    Bulk-create donators from an uploaded file
 * @access  Public
 */
router.post("/bulk-create", upload.single("file"), bulkCreateDonators);



module.exports = router;
