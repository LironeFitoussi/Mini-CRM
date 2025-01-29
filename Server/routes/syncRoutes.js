// routes/sync.js
const express = require('express');
const router = express.Router();
const Donor = require('../models/Donor');
const { syncDonationsForSingleDonor } = require('../controllers/syncController');

// Manually sync a single donor by local donor ID
router.post('/allodons/:donorId', async (req, res) => {
  try {
    const { donorId } = req.params;

    // 1) Find the donor in your local DB by _id
    const donor = await Donor.findById(donorId);

    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    // 2) Sync that single donor
    const { syncedCount } = await syncDonationsForSingleDonor(donor);

    // 3) Return a success response with how many new donations were synced
    res.status(200).json({
      message: `Synced donor ${donorId} successfully.`,
      donor: donor._id,
      newDonations: syncedCount,
    });
  } catch (error) {
    console.error('Error triggering manual single-donor sync:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;