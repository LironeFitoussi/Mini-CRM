const axios = require("axios");
const Donor = require("../models/Donor"); // <-- Adjust path as needed
const fs = require("fs");
/**
 * Synchronize donors from AlloDon to our local database.
 */
async function syncDonors() {
  try {
    console.log("Starting donors sync...");

    // (if not exisitng) Create a donotIds.json file in the root of the project
    // with an empty array as the content
    if (!fs.existsSync("./donotIds.json")) {
      fs.writeFileSync("./donotIds.json", "[]");
    }

    // Fetch donors from AlloDon (page=1, 10,000 per page)
    const page = 1;
    const limit = 10000;
    const response = await axios.get(
      `${process.env.ALLODON_URL}/donors?page=${page}&per_page=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.ALLODON_API_KEY}`,
        },
        // (Optional) to handle very large responses:
        // maxContentLength: Infinity,
        // maxBodyLength: Infinity,
      }
    );

    // According to your example, the data is in: response.data.donateurs
    const { donateurs } = response.data;

    if (!donateurs || !Array.isArray(donateurs)) {
      console.warn('No valid "donateurs" array found in the response.');
      return;
    }

    console.log(`Fetched ${donateurs.length} donors from AlloDon API.`);

    console.log("Syncing donors to local database...");

    const donorIds = JSON.parse(fs.readFileSync("./donotIds.json"));

    // For each donor from the API, sync to local DB
    for (const donor of donateurs) {
      if (donorIds.includes(donor.id)) {
        console.log(`Donor with allo_dons_id = ${donor.id} already exists.`);
        continue;
      }

      try {
        // Check if donor already exists locally by allo_dons_id
        const existingDonator = await Donor.findOne({ allo_dons_id: donor.id });

        // check if the donor ID is already in the donotIds.json file
        if (!existingDonator) {
          // Create a new Donor
          await Donor.create({
            allo_dons_id: donor.id,
            fName: donor.first_name || "",
            lName: donor.last_name || "",
            phone_number_1: {
              number: donor.phone || "",
            },
            email_1: {
              email: donor.email || "",
            },
            // status, birthdate, etc. will use schema defaults if not provided
          });
          console.log(`Created new donor: allo_dons_id = ${donor.id}`);

          // Append the new donor ID to the donotIds.json file
          donorIds.push(donor.id);
          fs.writeFileSync("./donotIds.json", JSON.stringify(donorIds));
        }
      } catch (innerErr) {
        // Handle any per-donor errors (validation, etc.)
        console.error(
          `Error processing donor with allo_dons_id = ${donor.id}: `,
          innerErr
        );
      }
    }

    console.log("Donors sync complete.");
  } catch (err) {
    // Handle overall request or other unexpected errors
    console.error("Error syncing donors:", err);
  }
}

module.exports = syncDonors;
