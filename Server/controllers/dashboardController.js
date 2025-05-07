const Donations = require("../models/Donation.js");
const Donors = require("../models/Donor");
const Notification = require("../models/Notification");
exports.getDashboardData = async (req, res) => {
  try {
    // Get the total amount of donors
    const totalDonors = await Donors.countDocuments();
    
    // Get the date range for the last 30 days
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const lastMonthStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    const lastMonthEnd = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);


    // Get donations from the last 30 days
    const donations = await Donations.find({
            date: { $gte: lastMonthStart, $lte: lastMonthEnd }
    });

    // Find donations with $ currency
    const dollarDonations = await Donations.find({ currency: '$' });
    console.log("Found dollar donations:", dollarDonations.map(d => ({ currency: d.currency, amount: d.amount })));

    // Find donations with USD currency
    const usdDonations = await Donations.find({ currency: 'USD' });
    console.log("Found USD donations:", usdDonations.map(d => ({ currency: d.currency, amount: d.amount })));

    console.log("Found donations:", donations.map(d => ({ currency: d.currency, amount: d.amount })));

    // Calculate total amounts by currency
    const totalAmounts = donations.reduce((acc, donation) => {
      const currency = donation.currency || 'EUR';
      acc[currency] = (acc[currency] || 0) + donation.amount;
      return acc;
    }, {});

    console.log("Total amounts by currency:", totalAmounts);
    
    // Get All Notifications
    const allNotifications = await Notification.find();

    // reduce the number of Donors in the notifications
    const donatorsWithCallback = allNotifications.filter(
      (notification) => notification.archived === false && notification.donatorId
    );
    
    // From donatorsWithCallback Get the ones where notificationDate is after now
    const donatorsWithPassedCallback = donatorsWithCallback.filter((notification) => {
      const now = new Date();
      const isAfterNow = notification.notificationDate < now;
      return isAfterNow && notification.archived === false;
    });

    // console.log(donatorsWithCallback);

    const totalDonatorsWithPassedCallback = donatorsWithPassedCallback.length;

    // Send the data as a response
    res.status(200).json({
      totalDonors,
      totalAmounts,
      donatorsWithCallback: donatorsWithCallback.length,
      totalDonatorsWithPassedCallback,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
