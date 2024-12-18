const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const uploadRoutes = require("./routes/upload");
const morgan = require("morgan");
const logger = require("./utils/logger"); // Using winston for logging
const initializeMailCronJob = require("./cronJobs/mailCron");
const mongoose = require("mongoose");
const Authorized = require("./models/Authorized");
dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());
app.use("/api/upload", uploadRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("Connected to MongoDB");
});

app.use("/api/v1/whatsapp", require("./routes/whatsappRoutes.js"));
app.use("/api/v1/donators", require("./routes/donatorsRoutes.js"));
app.use("/api/v1/contacts", require("./routes/contactsRoutes.js"));
app.use("/api/v1/donations", require("./routes/donationsRoutes.js"));
app.use("/api/v1/email", require("./routes/emailsRoutes.js"));

app.get("/api/v1/get-auth-user", (req, res) => {
  try {
    const users = Authorized.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Initialize Cron Jobs
initializeMailCronJob();

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
