const cron = require("node-cron");
const syncDonors = require("../scripts/syncDonors");

const initializeDonorsCronJob = () => {
  // Runs once a day at midnight
  cron.schedule("0 0 * * *", () => {
    console.log("Running daily donor sync...");
    syncDonors();
  });
};

module.exports = initializeDonorsCronJob;
