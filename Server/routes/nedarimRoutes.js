/**
 * Nedarim Routes
 *
 * This router handles all routes related to Nedarim-specific data, including:
 * - Retrieving all donations from the Nedarim platform
 * - Retrieving all donors associated with the Nedarim platform
 * - Getting stats and summaries for Nedarim data
 */

const express = require("express");
const router = express.Router();

// Import the Nedarim controller functions
const {
  getNedarimDonations,
  getNedarimDonors,
  getNedarimStats
} = require("../controllers/nedarimController");

// Routes for Nedarim donations
router.get("/donations", getNedarimDonations);

// Routes for Nedarim donors
router.get("/donors", getNedarimDonors);

// Route for Nedarim stats
router.get("/stats", getNedarimStats);

module.exports = router;