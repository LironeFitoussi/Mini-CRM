// scripts/syncAllodonDonations.js (or create a separate file if you want)
const axios = require('axios');
const Donation = require('../models/Donation');

async function syncDonationsForSingleDonor(donor) {
  try {
    // Check if donor has an allo_dons_id
    if (!donor.allo_dons_id) {
      console.log(`Donor ${donor._id} has no allo_dons_id, skipping sync.`);
      return { syncedCount: 0 };
    }

    // 1) Fetch remote donations from Allodon API
    const url = `${process.env.ALLODON_URL}/donors/${donor.allo_dons_id}`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${process.env.ALLODON_API_KEY}` },
    });

    // 2) Extract donations array
    const { donations = [] } = response.data;
    console.log(
      `Donor ${donor._id} (allo_dons_id: ${donor.allo_dons_id}) => ${donations.length} remote donations found.`
    );

    // 3) Track how many new donations we create
    let createdCount = 0;

    // 4) For each remote donation, check & create if needed
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

      // 4A) Check if donation already exists locally
      const existingDonation = await Donation.findOne({ remoteDonationId: remoteId });
      if (existingDonation) {
        // Already exists, skip
        continue;
      }

      // 4B) Create a new donation
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
        // platform defaults to 'allodons' if you set that in your schema
      });

      await newDonation.save();
      console.log(`Created new donation: remoteId=${remoteId}, donor=${donor._id}`);
      createdCount++;
    }

    return { syncedCount: createdCount };
  } catch (err) {
    console.error(`Error syncing donor ${donor._id}:`, err.message);
    throw err; // rethrow for the caller to handle
  }
}

module.exports = {
  syncDonationsForSingleDonor,
};