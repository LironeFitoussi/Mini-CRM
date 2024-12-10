const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const uploadRoutes = require("./routes/upload");
const morgan = require("morgan");
const axios = require("axios");
const imageUploader = require("./utils/imageUploader.js");
dotenv.config();

const app = express();
app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());
app.use("/api/upload", uploadRoutes);

app.get("/api/login-to-whatsapp", async (req, res) => {
  try {
    // Fetch the QR code image from the Python server
    const response = await axios.get("http://3.79.29.11/get-qr-code");

    // Extract the URL from the response
    const url = response.data.url;

    // Send the QR code URL as a response
    res.status(200).send({ url });
  } catch (error) {
    console.error("Error logging into WhatsApp:", {
      message: error.message,
      stack: error.stack,
      details: error.response ? error.response.data : null,
    });

    // Send a response if there's an error
    res
      .status(500)
      .json({ error: "Failed to login to WhatsApp", details: error.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
