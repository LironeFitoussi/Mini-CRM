// scripts/syncAllodonDonations.js
const axios = require('axios');
const Donation = require('../models/Donation');
const Donor = require('../models/Donor');

// A helper function to pause for the specified ms
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function syncAllodonDonations() {
  console.log('Starting Allodon donations sync...');

  try {
    // 1. Find all donors that have an allo_dons_id
    // const donors = await Donor.find({ allo_dons_id: { $exists: true } }); 
    // invert order
    const donors = await Donor.find({ allo_dons_id: { $exists: true } }).sort({ _id: -1 });
    console.log(`Found ${donors.length} donors with an allo_dons_id.`);

    // 2. Process each donor sequentially
    for (const donor of donors) {
      const donorId = donor._id.toString();
      const allodonId = donor.allo_dons_id; // or whatever your field is named

      try {
        // A) Fetch remote donations from Allodon API
        const url = `${process.env.ALLODON_URL}/donors/${allodonId}`;
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${process.env.ALLODON_API_KEY}` },
        });

        // B) Extract donations array from response
        const { donations = [] } = response.data;

        console.log(
          `Donor ${donorId} (allo_dons_id: ${allodonId}) => ${donations.length} remote donations found.`
        );

        // C) For each remote donation, check & create if needed
        for (const remoteDonation of donations) {
          const {
            id: remoteId,
            for_campain,
            amount,
            currency,
            euro_amount,
            date,
            mode,
            comment,
            transaction_id,
            cerfa,
            infos,
          } = remoteDonation;

          // C.1 Check if donation already exists
          const existingDonation = await Donation.findOne({ remoteDonationId: remoteId });
          if (existingDonation) {
            // Already exists, skip
            continue;
          }

          // C.2 Create a new donation
          const newDonation = new Donation({
            donator_id: donor._id,
            remoteDonationId: remoteId,
            for_campaign: !!for_campain,
            amount: amount,
            currency: currency,
            euro_amount: euro_amount,
            date: new Date(date),
            method: mode || 'unknown',
            notes: comment || '',
            transaction_id: transaction_id,
            cerfa: cerfa,
            infos: infos,
            type: for_campain ? 'campaign' : 'standard',
            // platform defaults to 'allodons' automatically (see schema)
          });

          await newDonation.save();
          console.log(`Created donation: remoteId=${remoteId} donor=${donorId}`);
        }
      } catch (err) {
        console.error(
          `Error processing donor ${donorId} (allo_dons_id: ${allodonId}):`,
          err.message
        );
      }

      // D) Wait 1 second before processing the next donor
      // await delay(1000);
    }

    console.log('Allodon donations sync completed successfully.');
  } catch (err) {
    console.error('Failed to complete Allodon donations sync:', err.message);
  }
}

module.exports = syncAllodonDonations;