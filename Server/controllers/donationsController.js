const Donation = require("../models/Donation.js");

// Get all donations
const getAllDonations = async (req, res) => {
    try {
        const donations = await Donation.find();
        res.status(200).json(donations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get donation by ID
const getDonationById = async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id);
        if (!donation) {
            return res.status(404).json({ message: "Donation not found" });
        }
        res.status(200).json(donation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new donation
const createDonation = async (req, res) => {
    const donation = new Donation(req.body);
    try {
        const newDonation = await donation.save();
        res.status(201).json(newDonation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a donation
const updateDonation = async (req, res) => {
    try {
        const updatedDonation = await Donation.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedDonation) {
            return res.status(404).json({ message: "Donation not found" });
        }
        res.status(200).json(updatedDonation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a donation
const deleteDonation = async (req, res) => {
    try {
        const deletedDonation = await Donation.findByIdAndDelete(req.params.id);
        if (!deletedDonation) {
            return res.status(404).json({ message: "Donation not found" });
        }
        res.status(200).json({ message: "Donation deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllDonationTypes = async (req, res) => {
    try {
        const allDonations = await Donation.find();

        console.log(allDonations);
        
        // Reduce the array of donations to an array of unique donation types
        const donationTypes = allDonations.reduce((acc, donation) => {
            if (!acc.includes(donation.type)) {
                acc.push(donation.type);
            }
            return acc;
        } , []);
        res.status(200).json(donationTypes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAllDonations, getDonationById, createDonation, updateDonation, deleteDonation, getAllDonationTypes };