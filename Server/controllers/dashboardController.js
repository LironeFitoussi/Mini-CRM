const Donations = require("../models/Donation.js");
const Donors = require("../models/Donor");
const Notification = require("../models/Notification");
exports.getDashboardData = async (req, res) => {
  try {
    // Get the total amount of donors
    const totalDonors = await Donors.countDocuments();
    
    // Get the date range for the last 30 days
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    // Count the number of donations made in the last 30 days
    const totalDonations = await Donations.countDocuments({
      date: {
        $gte: oneMonthAgo,
        $lte: now
      }
    });

    console.log("Number of donations made:", totalDonations);
    
    // Get All Notifications
    const allNotifications = await Notification.find();

    // reduce the number of Donors in the notifications
    const donatorsWithCallback = allNotifications.filter(
      (notification) => notification.archived === false && notification.donatorId
    );
    
    // From donatorsWithCallback Get the ones where notificationDate is after now
    const donatorsWithPassedCallback = donatorsWithCallback.filter((notification) => {
      const isAfterNow = notification.notificationDate < now;
      return isAfterNow && notification.archived === false;
    });

    const totalDonatorsWithPassedCallback = donatorsWithPassedCallback.length;

    // Send the data as a response
    res.status(200).json({
      totalDonors,
      totalDonations,
      donatorsWithCallback: donatorsWithCallback.length,
      totalDonatorsWithPassedCallback,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
