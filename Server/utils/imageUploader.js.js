const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const ProgressBar = require("progress"); // Import the progress package
const fs = require("fs").promises; // Use promises for async file operations
const path = require("path");
require("dotenv").config();

// Configure AWS S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Handles the uploading of an image file to the local directory and S3.
 * @param {Object} file - The file object from multer.
 * @returns {Object} - The status of the upload including the local path and S3 URL.
 */
async function imageUploader(file) {
  try {
    if (!file) {
      throw new Error("No file uploaded");
    }

    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    // Save file locally
    const localFilePath = path.join(uploadsDir, `${Date.now()}-${file.originalname}`);
    await fs.writeFile(localFilePath, file.buffer);

    // S3 upload parameters
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${Date.now()}-${file.originalname}`, // Unique filename
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    // Initialize ProgressBar
    const progressBar = new ProgressBar("Uploading [:bar] :percent :etas", {
      width: 40,
      complete: "=",
      incomplete: " ",
      total: file.size,
    });

    // Upload to S3 with progress tracking
    const upload = new Upload({
      client: s3Client,
      params,
    });

    upload.on("httpUploadProgress", (progress) => {
      progressBar.tick(progress.loaded - progressBar.curr);
    });

    const result = await upload.done();

    // Construct file URL
    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;

    return {
      message: "Upload successful",
      localPath: localFilePath,
      url: fileUrl,
    };
  } catch (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }
}

module.exports = imageUploader;
