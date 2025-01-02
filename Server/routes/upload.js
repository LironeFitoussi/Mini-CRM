const express = require("express");
const multer = require("multer");
const imageUploader = require("../utils/imageUploader.js");
const router = express.Router();

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// File upload route with retry logic
router.post("/", upload.single("image"), async (req, res) => {
  // console.log("Received a request to upload a file");
  const maxAttempts = 3;
  let attempt = 0;
  let success = false;
  let status;

  while (attempt < maxAttempts && !success) {
    try {
      const file = req.file;
      status = await imageUploader(file);
      success = true;
    } catch (err) {
      attempt++;
      console.error(`Attempt ${attempt} failed. Error details:`, err);
      if (attempt >= maxAttempts) {
        console.error("Max attempts reached. Failed to upload file.");
        return res.status(500).json({
          error: "Failed to upload file after multiple attempts",
          details: err.message || "Unknown error occurred",
        });
      }
    }
  }

  res.status(200).json(status);
});

module.exports = router;
