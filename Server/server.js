const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const uploadRoutes = require("./routes/upload");
const morgan = require("morgan");
const initializeMailCronJob = require("./cronJobs/mailCron");
const initializeDonorsCronJob = require("./cronJobs/donorsCron");
const Authorized = require("./models/Authorized");
dotenv.config();
const PORT = process.env.PORT || 3000;
const path = require("path");
const app = express();

// Actions to take when the server is started
const connectDB = require('./config/db');
const syncDonors = require('./scripts/syncDonors');

app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());
app.use("/api/upload", uploadRoutes);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

connectDB();
// syncDonors();


app.use("/api/v1/users", require("./routes/usersRoutes.js"));
app.use("/api/v1/whatsapp", require("./routes/whatsappRoutes.js"));
app.use("/api/v1/donors", require("./routes/donorsRoutes.js"));
app.use("/api/v1/contacts", require("./routes/contactsRoutes.js"));
app.use("/api/v1/donations", require("./routes/donationsRoutes.js"));
app.use("/api/v1/email", require("./routes/emailsRoutes.js"));
app.use("/api/v1/dashboard", require("./routes/dashboardRoutes.js"));
app.use("/api/v1/mail-templates", require("./routes/mailTemplateRoutes"));
app.use("/api/v1/leads", require("./routes/leadRoutes"));
app.use("/api/v1/notes", require("./routes/noteRoutes"));
app.use("/api/v1/notifications", require("./routes/notificationRoutes.js"));
app.use("/unsubscribe", require("./routes/unsubscribeRoutes.js"));
app.use('/api/v1/sms', require('./routes/sms.js'));
app.use('/api/v1/twilio', require('./routes/twilioInbound.js'));
app.use('/api/v1/allodon', require('./routes/allodonRoutes.js'));

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
initializeDonorsCronJob();

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
