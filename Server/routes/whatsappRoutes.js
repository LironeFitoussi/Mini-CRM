const express = require("express");
const Contact = require("../models/Contact");
const PYTHON_SERVER_URL = process.env.MODE === "development" ? "http://localhost:5000" : "http://5.28.180.39:5000";

const router = express.Router();

router.get("/contacts", async (req, res) => {
  try {
    const { query } = req;

    // Extract pagination parameters from query
    const page = parseInt(query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(query.limit) || 10; // Default to 10 items per page if not provided
    const skip = (page - 1) * limit;
    let is_whatsapp;
    switch (query.is_whatsapp) {
      case "true":
        is_whatsapp = true;
        break;
      case "false":
        is_whatsapp = false;
        break;
      default:
        is_whatsapp = "unknown";
    }

    console.log("params", query);

    // Fetch valid_numbers collection (query) from the database (MongoDB) with pagination
    const contacts = await Contact.find({ is_whatsapp })
      .skip(skip)
      .limit(limit);

    // Get total count of documents
    const totalDocuments = await Contact.countDocuments({ is_whatsapp });

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

router.get("/login-to-whatsapp", async (req, res) => {
  console.log("Logging in to WhatsApp...");
  try {
    // Fetch the QR code image from the Python server
    const response = await axios.get(`${PYTHON_SERVER_URL}/get-qr-code`);

    console.log(response.data);

    // Extract the URL from the response
    const url = response.data.url;

    if (!url && response.data.message === "User is already logged in.") {
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

router.get("/logout", async (req, res) => {
  try {
    // Fetch the QR code image from the Python server
    const response = await axios.post(`${PYTHON_SERVER_URL}/logout`);

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

router.post("/notify-sendstatus", async (req, res) => {
  try {
    const { body } = req;
    console.log("Notify send status", body);

    // Send the QR code URL as a response
    res.status(200).send({ message: "Notification received" });
  } catch (error) {
    console.error("Error notifying send status:", {
      message: error.message,
      stack: error.stack,
    });

    // Send a response if there's an error
    res
      .status(500)
      .json({ error: "Failed to notify send status", details: error.message });
  }
});

router.post("/bot-error", async (req, res) => {
  try {
    const { body } = req;
    console.log("Bot error", body);

    // Send the QR code URL as a response
    res.status(200).send({ message: "Bot error received" });
  } catch (error) {
    console.error("Error notifying bot error:", {
      message: error.message,
      stack: error.stack,
    });

    // Send a response if there's an error
    res
      .status(500)
      .json({ error: "Failed to notify bot error", details: error.message });
  }
});

router.post("/success-log", async (req, res) => {
  try {
    const { body } = req;
    console.log("Success log", body);

    // Send the QR code URL as a response
    res.status(200).send({ message: "Success log received" });
  } catch (error) {
    console.error("Error notifying success log:", {
      message: error.message,
      stack: error.stack,
    });

    // Send a response if there's an error
    res
      .status(500)
      .json({ error: "Failed to notify success log", details: error.message });
  }
});

module.exports = router;