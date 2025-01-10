const Donations = require("../models/Donation.js");
const Donators = require("../models/Donator");
const Notification = require("../models/Notification");
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

    // Get All Notifications
    const allNotifications = await Notification.find();


    // reduce the number of Donators in the notifications
    const donatorsWithCallback = allNotifications.filter(
      (notification) => notification.archived === false && notification.donatorId
    );

    console.log(donatorsWithCallback);
    
    // From donatorsWithCallback Get the ones where notificationDate is after now
    totalDonatorsWithPassedCallback = donatorsWithCallback.filter(
      (notification) => notification.notificationDate > new Date() && notification.archived === false
    ).length;

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
