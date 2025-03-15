// routes/sync.js
const express = require('express');
const router = express.Router();
const Donor = require('../models/Donor');
const { syncDonationsForSingleDonor } = require('../controllers/syncController');
const { syncAllodonClients } = require('../sync/syncAllodon');
const { syncNedarimDonations } = require('../sync/syncNedarim');
const { syncAlloDonations } = require('../sync/syncAlloDonations');
const { performDailySync } = require('../cronJobs/dailySyncCron');

// Track last full sync status
let lastFullSyncStatus = {
  lastRun: null,
  status: 'never run',
  error: null
};

// Track last daily sync status
let lastDailySyncStatus = {
  lastRun: null,
  status: 'never run',
  error: null,
  results: null
};

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

// Full sync function
const performFullSync = async () => {
  console.log(`\n========================================`);
  console.log(`🔄 Starting manual full sync: ${new Date().toISOString()}`);
  console.log(`========================================\n`);

  try {
    // 1. First sync Allodon clients
    console.log('Step 1: Syncing Allodon clients...');
    await syncAllodonClients();
    console.log('✅ Allodon clients sync completed');

    // 2. Then sync Allodon donations
    console.log('\nStep 2: Syncing Allodon donations...');
    await syncAlloDonations();
    console.log('✅ Allodon donations sync completed');

    // 3. Finally sync Nedarim donations
    console.log('\nStep 3: Syncing Nedarim donations...');
    await syncNedarimDonations();
    console.log('✅ Nedarim donations sync completed');

    console.log(`\n✅ Full sync completed successfully at ${new Date().toISOString()}`);
    
    lastFullSyncStatus = {
      lastRun: new Date(),
      status: 'success',
      error: null
    };
    
    return true;
  } catch (error) {
    console.error('❌ Error during full sync:', error);
    
    lastFullSyncStatus = {
      lastRun: new Date(),
      status: 'failed',
      error: error.message
    };
    
    return false;
  }
};

// API endpoint for triggering a full sync
router.post('/full', async (req, res) => {
  try {
    console.log('🔄 Manual full sync triggered via API');
    const success = await performFullSync();
    
    res.json({
      success,
      message: success ? 'Full sync completed successfully' : 'Full sync failed',
      lastRun: lastFullSyncStatus.lastRun
    });
  } catch (error) {
    console.error('❌ Error during manual full sync:', error);
    
    res.status(500).json({
      success: false,
      message: 'Full sync failed',
      error: error.message
    });
  }
});

// API endpoint for triggering a daily sync
router.post('/daily', async (req, res) => {
  try {
    console.log('🔄 Manual daily sync triggered via API');
    
    const result = await performDailySync();
    
    lastDailySyncStatus = {
      lastRun: new Date(),
      status: result.success ? 'success' : 'failed',
      error: result.error || null,
      results: result.results
    };
    
    res.json({
      success: result.success,
      message: result.success ? 'Daily sync completed successfully' : 'Daily sync failed',
      results: result.results
    });
  } catch (error) {
    console.error('❌ Error during manual daily sync:', error);
    
    lastDailySyncStatus = {
      lastRun: new Date(),
      status: 'failed',
      error: error.message,
      results: null
    };
    
    res.status(500).json({
      success: false,
      message: 'Daily sync failed',
      error: error.message
    });
  }
});

// API endpoint to get last full sync status
router.get('/status', (req, res) => {
  res.json(lastFullSyncStatus);
});

// API endpoint to get last daily sync status
router.get('/daily/status', (req, res) => {
  res.json(lastDailySyncStatus);
});

module.exports = router;