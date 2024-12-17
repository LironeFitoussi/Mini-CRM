const nodemailer = require("nodemailer");
const MailSender = require("../models/MailSender.js");

require("dotenv").config();

// Email sending controller
const sendEmail = async (req, res) => {
  const { from, to, subject, body } = req.body;

  //   if "to" is bigger than 500, split it into multiple arrays of 450
  if (to.length > 500) {
    let tos = [];
    let i = 0;
    while (i < to.length) {
      tos.push(to.slice(i, i + 450));
      i += 450;
    }
    tos.forEach(async (tos) => {
      await sendEmail(from, tos, subject, body);
    });
    return res.status(200).json({ message: "Email sent successfully!" });
  }

  // Get the sender's email from the database based on from field
  const sender = await MailSender.findOne({ email: from });

  // Create a transporter using SMTP
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: sender.email, // Gmail address
      pass: sender.password, // Gmail password or app-specific password
    },
  });

  // Verify the connection configuration
  transporter.verify(function (error, success) {
    if (error) {
      console.error("Error connecting to SMTP server:", error);
    } else {
      console.log("SMTP server is ready to take our messages");
    }
  });

  // Basic validation
  if (!from || !to || !subject || !body) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Define email options
  const mailOptions = {
    from: sender.email, // sender address
    to: Array.isArray(to) ? to.join(", ") : to, // list of receivers
    subject: subject, // Subject line
    html: body, // html body
  };

  try {
    // Send email
    let info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    res
      .status(200)
      .json({ message: "Email sent successfully!", messageId: info.messageId });
  } catch (error) {
    console.error("Error sending email:", error);
    res
      .status(500)
      .json({ message: "Failed to send email.", error: error.toString() });
  }
};

const addMailSender = async (req, res) => {
  const { email, name, password } = req.body;

  // Basic validation
  if (!email || !name || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Create a new MailSender document
    const newMailSender = new MailSender({
      email,
      name,
      password,
    });

    // Save the document to the database
    await newMailSender.save();
    res.status(201).json({ message: "Mail sender added successfully!" });
  } catch (error) {
    console.error("Error adding mail sender:", error);
    res
      .status(500)
      .json({ message: "Failed to add mail sender.", error: error.toString() });
  }
};

// ykpp uzag thdc asvk

module.exports = {
  sendEmail,
  addMailSender,
};
