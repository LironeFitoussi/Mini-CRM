const express = require("express");

const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const { getAllDonators, getDonatorById, createDonator, updateDonator, deleteDonator, bulkCreateDonators, getTotalDonators } = require("../controllers/donatorsController");

router.get("/", getAllDonators);

router.get("/total", getTotalDonators);

router.get("/:id", getDonatorById);

router.post("/", createDonator);

router.put("/:id", updateDonator);

router.delete("/:id", deleteDonator);

router.post("/bulk-create", upload.single("file"), bulkCreateDonators);

module.exports = router;