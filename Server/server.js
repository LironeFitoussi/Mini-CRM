const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const uploadRoutes = require("./routes/upload");
const morgan = require("morgan");
const axios = require("axios");
const imageUploader = require("./utils/imageUploader.js");
const mongoose = require("mongoose");
const Contact = require("./models/Contact");

dotenv.config();

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());
app.use("/api/upload", uploadRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("Connected to MongoDB");
});

app.get("/api/contacts", async (req, res) => {
  try {
    const { query } = req;

    // Extract pagination parameters from query
    const page = parseInt(query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(query.limit) || 10; // Default to 10 items per page if not provided
    const skip = (page - 1) * limit;
    let is_whatsapp;
    switch (query.is_whatsapp) {
      case 'true':
        is_whatsapp = true;
        break;
      case 'false':
        is_whatsapp = false;
        break;
      default:
        is_whatsapp = 'unknown';
    }

    console.log("params", query);

    // Fetch valid_numbers collection (query) from the database (MongoDB) with pagination
    const contacts = await Contact.find({is_whatsapp})
      .skip(skip)
      .limit(limit);

    // Get total count of documents
    const totalDocuments = await Contact.countDocuments({is_whatsapp});

    console.log(totalDocuments);
    
    // Calculate total pages
    const totalPages = Math.ceil(totalDocuments / limit);

    // Send the paginated data and metadata as a response
    res.status(200).json({
      currentPage: page,
      totalPages,
      totalDocuments,
      contacts,
    });
  } catch (error) {
    console.error("Error fetching contacts:", {
      message: error.message,
      stack: error.stack,
    });

    // Send a response if there's an error
    res
      .status(500)
      .json({ error: "Failed to fetch contacts", details: error.message });
  }
});



app.get("/api/login-to-whatsapp", async (req, res) => {
  console.log("Logging in to WhatsApp...");
  try {
    // Fetch the QR code image from the Python server
    const response = await axios.get("http://localhost:5000/get-qr-code");

    console.log(response.data);
    
    // Extract the URL from the response
    const url = response.data.url;

    if (!url && response.data.message === 'User is already logged in.') {
      return res.status(400).json({ error: response.data.message });
    }

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

app.get("/api/logout", async (req, res) => {
  try {
    // Fetch the QR code image from the Python server
    const response = await axios.post("http://localhost:5000/logout");

    console.log(response.data);
    
    // Extract the URL from the response
    const message = response.data.message;

    // Send the QR code URL as a response
    res.status(200).send({ message });
  } catch (error) {
    console.error("Error logging out of WhatsApp:", {
      message: error.message,
      stack: error.stack,
      details: error.response ? error.response.data : null,
    });

    // Send a response if there's an error
    res
      .status(500)
      .json({ error: "Failed to logout of WhatsApp", details: error.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
