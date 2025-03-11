const cron = require('node-cron');
const { syncAllodonClients } = require('../sync/syncAllodon');
const { syncNedarimDonations } = require('../sync/syncNedarim');
const { syncAlloDonations } = require('../sync/syncAlloDonations');
const logger = require('../utils/logger');

// Utility function to get date 24 hours ago
const get24HoursAgo = () => {
  const date = new Date();
  date.setHours(date.getHours() - 24);
  return date;
};

// Main sync function that orchestrates all sync operations
const performFullSync = async () => {
  logger.info('🔄 Starting full sync: ' + new Date().toISOString());

  try {
    // 1. First sync Allodon clients
    logger.info('Step 1: Syncing Allodon clients...');
    await syncAllodonClients();
    logger.info('✅ Allodon clients sync completed');

    // 2. Then sync Allodon donations (last 24 hours)
    logger.info('\nStep 2: Syncing Allodon donations from the last 24 hours...');
    await syncAlloDonations();
    logger.info('✅ Allodon donations sync completed');

    // 3. Finally sync Nedarim donations
    logger.info('\nStep 3: Syncing Nedarim donations...');
    await syncNedarimDonations();
    logger.info('✅ Nedarim donations sync completed');

    logger.info('\n✅ Full sync completed successfully at ' + new Date().toISOString());
    return true;
  } catch (error) {
    logger.error('❌ Error during full sync:', error);
    return false;
  }
};

// Initialize the cron job
const initializeSyncCronJob = () => {
  // Run sync on startup
  logger.info('🚀 Performing initial sync on server startup...');
  performFullSync().then(success => {
    logger.info(`Initial sync ${success ? 'completed successfully' : 'failed'}`);
  }).catch(error => {
    logger.error('Error during initial sync:', error);
  });

  // Schedule daily sync at midnight
  cron.schedule('0 0 * * *', () => {
    logger.info('Running daily full sync...');
    performFullSync();
  });

  logger.info('✅ Sync cron job initialized (runs daily at midnight)');
};

// Export functions for use in API routes and server startup
module.exports = initializeSyncCronJob; 