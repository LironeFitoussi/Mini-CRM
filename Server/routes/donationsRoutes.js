const express = require("express");
const router = express.Router();

const { getAllDonations, getDonationById, createDonation, getDonationsByAllodonId, updateDonation, deleteDonation, getAllDonationTypes } = require("../controllers/donationsController");

router.get("/all-types", getAllDonationTypes);

router.get("/", getAllDonations);

router.get("/allodon/:id", getDonationsByAllodonId);

router.get("/:id", getDonationById);

router.post("/", createDonation);

router.put("/:id", updateDonation);

router.delete("/:id", deleteDonation);

module.exports = router;