const Donations = require("../models/Donation.js");
const Donators = require("../models/Donator");

exports.getDashboardData = async (req, res) => {
  try {
    // Get the total amount of donators
    const totalDonators = await Donators.countDocuments();
    // Get the total amount of donations for current month
    const currentMonth = new Date().getMonth();
    const totalDonations = await Donations.aggregate([
      {
        $match: {
          month: currentMonth,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    // Get the total amount of donators with callback dates
    const totalDonatorsArray = await Donators.find();
    const donatorsWithCallback = totalDonatorsArray.filter(
      (donator) => donator.nextContactDate
    );

    // Get the total amount of Donators with passed callback dates
    const totalDonatorsWithPassedCallback = donatorsWithCallback.filter(
      (donator) => new Date(donator.nextContactDate.dueDate) < new Date()
    ).length;

    // Get the total amount of Donators with upcoming callback dates

    // Send the data as a response
    res.status(200).json({
      totalDonators,
      totalDonations: totalDonations.length ? totalDonations[0].total : 0,
      donatorsWithCallback: donatorsWithCallback.length,
      totalDonatorsWithPassedCallback,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
