// controllers/sendEmail.js

const nodemailer = require("nodemailer");
const MailSender = require("../models/MailSender.js");
const MailJob = require("../models/MailJob.js");
const splitArray = require("../utils/splitRecipients.js");
const logger = require("../utils/logger"); // Assuming you have a logger setup

require("dotenv").config();

// Maximum number of recipients per email as per Gmail's limitations
const MAX_RECIPIENTS_PER_EMAIL = 400;

// Flag to enable/disable actual email sending (set to false for testing)
const ENABLE_ACTUAL_SENDING = process.env.DEV_MODE === "true" ? false : true;

function manipulateAnchors(htmlString) {
  // Match all anchor tags using a regular expression
  return htmlString.replace(/<a\s+([^>]*?)>(.*?)<\/a>/gi, (match, attributes, innerText) => {
      // Extract the href attribute from the anchor tag
      const hrefMatch = attributes.match(/href=['"](.*?)['"]/i);
      const href = hrefMatch ? hrefMatch[1] : '#';

      // Create the modified structure with proper href formatting
      // Only prepend https:// if it doesn't already have a protocol
      const formattedHref = href.startsWith('http') ? href : `https://${href}`;
      
      return `<a rel="nofollow" href="${formattedHref}" style="color: blue; text-decoration: underline;" ${attributes.replace(/href=['"].*?['"]/i, '')}>${innerText}</a>`;
  });
}

// Process and sanitize the email body
function processEmailBody(body) {
  // First ensure all anchor tags are properly formatted
  let processedBody = manipulateAnchors(body);
  
  // Handle any other processing needed for the body
  // For example, sanitize or transform other HTML elements
  
  return processedBody;
}

// Email sending controller
const sendEmail = async (req, res) => {
  const { from, to, subject, body, imageUrl, imageLink, isImageClickable, clickableImageText } = req.body;

  // Basic validation
  if (!from || !to || !subject || !body) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Get the sender's email from the database based on 'from' field
    const sender = await MailSender.findOne({ email: from });

    if (!sender) {
      return res.status(404).json({ message: "Sender not found." });
    }

    // Ensure 'to' is an array
    const recipients = Array.isArray(to) ? to : [to];

    // Split recipients into chunks of MAX_RECIPIENTS_PER_EMAIL
    const recipientChunks = splitArray(recipients, MAX_RECIPIENTS_PER_EMAIL);

    // Array to hold created MailJob documents
    const createdMailJobs = [];

    // Process the email body
    const processedBody = processEmailBody(body);

    for (let i = 0; i < recipientChunks.length; i++) {
      const chunk = recipientChunks[i];

      // Create a MailJob document with all the necessary email properties
      const mailJob = new MailJob({
        recipients: chunk,
        subject,
        body: processedBody,
        imageUrl,
        imageLink,
        isImageClickable,
        clickableImageText,
        sender: sender._id,
        is_sent: false, // Initially set to false; will be updated after sending
      });

      // Save the MailJob document
      await mailJob.save();
      createdMailJobs.push(mailJob);
    }

    // Send the first MailJob immediately
    if (createdMailJobs.length > 0) {
      const firstMailJob = createdMailJobs[0];

      // Define email options for the first MailJob with dynamic from field
      const mailOptions = {
        from: `Rav Benyamin Chemouny <${sender.email}>`, // Dynamically set sender name and email
        to: firstMailJob.recipients.join(", "), // list of receivers
        subject: firstMailJob.subject, // Subject line
        html: firstMailJob.body, // html body
      };

      try {
        let info;
        
        if (ENABLE_ACTUAL_SENDING) {
          // Create a transporter using SMTP
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: sender.email, // Gmail address
              pass: sender.password, // Gmail app password or app-specific password
            },
          });

          // Verify the connection configuration
          await transporter.verify();
          logger.info("✅ SMTP server is ready to take our messages");
          
          // Actually send the email
          info = await transporter.sendMail(mailOptions);
          logger.info("✅ Message sent: %s", info.messageId);
        } else {
          // Simulate email sending
          info = {
            messageId: `simulated-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
            envelope: {
              from: sender.email,
              to: firstMailJob.recipients
            }
          };
          
          // Log the simulated email details
          logger.info("✅ SIMULATED EMAIL - Not actually sent");
          logger.info(`📧 From: ${mailOptions.from}`);
          logger.info(`📧 To: ${mailOptions.to}`);
          logger.info(`📧 Subject: ${mailOptions.subject}`);
          logger.info(`📧 Body length: ${mailOptions.html.length} characters`);
          logger.info(`✅ Simulated message ID: ${info.messageId}`);
          
          // Add a small delay to simulate actual sending time
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Update the first MailJob as sent
        firstMailJob.is_sent = true;
        await firstMailJob.save();
        logger.info(`🗂️ Mail job marked as sent: ${firstMailJob._id}`);

        res.status(200).json({
          message: ENABLE_ACTUAL_SENDING ? "Email sent successfully!" : "Email simulated successfully (not actually sent)!",
          messageId: info.messageId,
          mailJobsCreated: createdMailJobs.length,
          simulatedMode: !ENABLE_ACTUAL_SENDING
        });
      } catch (error) {
        logger.error("❌ Error sending email:", error);
        res.status(500).json({
          message: "Failed to send email.",
          error: error.toString(),
        });
      }
    } else {
      res.status(400).json({ message: "No recipients provided." });
    }
  } catch (error) {
    logger.error("❌ Error creating mail jobs:", error);
    res.status(500).json({
      message: "Failed to create mail jobs.",
      error: error.toString(),
    });
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
