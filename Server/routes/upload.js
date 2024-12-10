const express = require("express");
const multer = require("multer");
const imageUploader = require("../utils/imageUploader.js");
const router = express.Router();

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// File upload route
router.post("/", upload.single("image"), async (req, res) => {
  console.log("Received a request to upload a file");
  try {
    const file = req.file;
    const status = await imageUploader(file);

    res.status(200).json(status);
  } catch (err) {
    console.error("An error occurred during the upload process");
    console.error("Error details:", err);

    res.status(500).json({
      error: "Failed to upload file",
      details: err.message || "Unknown error occurred",
    });
  }
});

module.exports = router;
