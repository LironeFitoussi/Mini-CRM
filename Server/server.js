const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const uploadRoutes = require("./routes/upload");
const morgan = require("morgan");
const axios = require("axios");
const imageUploader = require("./utils/imageUploader.js");
const mongoose = require("mongoose");

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

app.use('/api/v1/whatsapp', require('./routes/whatsappRoutes.js'));
app.use('/api/v1/donators', require('./routes/donatorsRoutes.js'));
app.use('/api/v1/contacts', require('./routes/contactsRoutes.js'));
app.use('/api/v1/donations', require('./routes/donationsRoutes.js'));

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

