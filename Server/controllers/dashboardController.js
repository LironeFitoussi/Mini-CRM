const Donations = require("../models/Donation.js");
const Donors = require("../models/Donor");
const Notification = require("../models/Notification");
exports.getDashboardData = async (req, res) => {
  try {
    // Get the total amount of donors
    const totalDonators = await Donors.countDocuments();
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

    // reduce the number of Donors in the notifications
    const donatorsWithCallback = allNotifications.filter(
      (notification) => notification.archived === false && notification.donatorId
    );

    // console.log(donatorsWithCallback);
    
    // From donatorsWithCallback Get the ones where notificationDate is after now
    const now = new Date();
    // console.log(`Current date and time: ${now}`);
    
    const donatorsWithPassedCallback = donatorsWithCallback.filter((notification) => {
      const isAfterNow = notification.notificationDate < now;
      // console.log(`Notification ID: ${notification._id}, Notification Date: ${notification.notificationDate}, Is after now: ${isAfterNow}`);
      return isAfterNow && notification.archived === false;
    });

    const totalDonatorsWithPassedCallback = donatorsWithPassedCallback.length;
    // console.log(`Total donors with passed callback: ${totalDonatorsWithPassedCallback}`);

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
