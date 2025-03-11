// routes/dailySyncRoutes.js
const express = require('express');
const router = express.Router();
const { performDailySync } = require('../cronJobs/dailySyncCron');

// Track last sync status
let lastSyncStatus = {
  lastRun: null,
  status: 'never run',
  error: null,
  results: null
};

// API endpoint for triggering a daily sync
router.post('/trigger', async (req, res) => {
  try {
    console.log('🔄 Manual daily sync triggered via API');
    
    const result = await performDailySync();
    
    lastSyncStatus = {
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
    
    lastSyncStatus = {
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

// API endpoint to get last sync status
router.get('/status', (req, res) => {
  res.json(lastSyncStatus);
});

module.exports = router; 