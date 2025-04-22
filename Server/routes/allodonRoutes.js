/**
 * Allodon Routes
 *
 * This router handles all routes related to Allodon-specific data, including:
 * - Retrieving all donations from the Allodon platform
 * - Retrieving all donors associated with the Allodon platform
 * - Getting stats and summaries for Allodon data
 */

const express = require("express");
const router = express.Router();
const axios = require("axios");

// Import the Allodon controller functions
const {
  getAllodonDonations,
  getAllodonDonors,
  getAllodonStats,
  getAllodonLastMonthDonations
} = require("../controllers/allodonController");

router.get("/unlimited", async (req, res) => {
  try {
    const response = await axios.get(
      "http://www.allodons.fr/api/data/les-enfants-de-rachi/donors?page=1&per_page=60000",
      {
        headers: {
          Authorization: `Bearer ${process.env.ALLODON_API_KEY}`,
        },
      }
    );
    res.json(response.data.donateurs.length);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes for Allodon donations
router.get("/donations", getAllodonDonations);

// Last Month Donations 
router.get("/last-month-donations", getAllodonLastMonthDonations);

// Routes for Allodon donors
router.get("/donors", getAllodonDonors);

// Route for Allodon stats
router.get("/stats", getAllodonStats);

module.exports = router;
