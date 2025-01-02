const Donations = require('../models/Donation.js');
// const Users = require('../models/Users');
const Tasks = require('../models/Task');
const Donators = require('../models/Donator');

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

        // Get the total amount of tasks "pending"
        const totalTasks = await Tasks.countDocuments({ status: "pending" });
        // Get the total amount of tasks "critical"
        const totalCriticalTasks = await Tasks.countDocuments({ status: "critical" });

        // Send the data as a response
        res.status(200).json({
            totalDonators,
            totalDonations: totalDonations.length ? totalDonations[0].total : 0,
            totalTasks,
            totalCriticalTasks,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}