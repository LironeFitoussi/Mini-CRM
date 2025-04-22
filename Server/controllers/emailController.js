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

// Test email configuration
const TEST_EMAILS = {
  sender: "lironefit@gmail.com",
  recipients: [
    "test.recipient1@gmail.com",
    "test.recipient2@gmail.com",
    "test.recipient3@gmail.com"
  ]
};

// Function to check if we're in test mode
const isTestMode = () => {
  return process.env.NODE_ENV === 'test' || process.env.DEV_MODE === 'true';
};

// Function to get test or real email addresses
const getEmailAddresses = (from, to) => {
  if (isTestMode()) {
    return {
      from: from, // Use the actual from email instead of test sender
      to: TEST_EMAILS.recipients
    };
  }
  return { from, to };
};

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
    // Get email addresses (test or real)
    const { from: actualFrom, to: actualTo } = getEmailAddresses(from, to);

    // Debug log for sender lookup
    logger.info(`🔍 Looking up sender with email: ${actualFrom}`);

    // Get the sender's email from the database based on 'from' field
    const sender = await MailSender.findOne({ email: actualFrom });

    // Debug log for sender lookup result
    logger.info(`🔍 Sender lookup result: ${sender ? 'Found' : 'Not found'}`);
    if (sender) {
      logger.info(`🔍 Sender details: ${JSON.stringify(sender)}`);
    }

    if (!sender) {
      // Get all available senders for debugging
      const allSenders = await MailSender.find({}, { email: 1, _id: 0 });
      logger.error(`❌ Sender not found. Available senders: ${JSON.stringify(allSenders)}`);
      
      return res.status(404).json({ 
        message: "Sender not found.",
        details: {
          searchedEmail: actualFrom,
          availableSenders: allSenders
        }
      });
    }

    // Ensure 'to' is an array
    const recipients = Array.isArray(actualTo) ? actualTo : [actualTo];

    // Create a single MailJob document for all recipients
    const mailJob = new MailJob({
      recipients,
      subject,
      body: processEmailBody(body),
      imageUrl,
      imageLink,
      isImageClickable,
      clickableImageText,
      sender: sender._id,
      is_sent: false,
    });

    // Save the MailJob document
    await mailJob.save();

    // Define email options with BCC
    const mailOptions = {
      from: `Rav Benyamin Chemouny <${sender.email}>`,
      to: recipients.join(", "), // Send directly to recipients
      subject: mailJob.subject,
      html: mailJob.body,
    };

    try {
      let info;
      
      if (ENABLE_ACTUAL_SENDING) {
        // Create a transporter using SMTP
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: sender.email,
            pass: sender.password,
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        // Verify the connection configuration
        await transporter.verify();
        logger.info("✅ SMTP server is ready to take our messages");
        
        // Send the email with BCC
        info = await transporter.sendMail(mailOptions);
        logger.info("✅ Message sent: %s", info.messageId);
        logger.info("✅ Message details:", info);
      } else {
        // Simulate email sending
        info = {
          messageId: `simulated-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
          envelope: {
            from: sender.email,
            to: sender.email,
            bcc: recipients
          }
        };
        
        // Log the simulated email details
        logger.info("✅ SIMULATED EMAIL - Not actually sent");
        logger.info(`📧 From: ${mailOptions.from}`);
        logger.info(`📧 To: ${mailOptions.to}`);
        logger.info(`📧 BCC: ${mailOptions.bcc}`);
        logger.info(`📧 Subject: ${mailOptions.subject}`);
        logger.info(`📧 Body length: ${mailOptions.html.length} characters`);
        logger.info(`✅ Simulated message ID: ${info.messageId}`);
        
        // Add a small delay to simulate actual sending time
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Update the MailJob as sent
      mailJob.is_sent = true;
      mailJob.successful_recipients = recipients;
      await mailJob.save();
      logger.info(`🗂️ Mail job marked as sent: ${mailJob._id}`);

      res.status(200).json({
        message: ENABLE_ACTUAL_SENDING ? "Email sent successfully!" : "Email simulated successfully (not actually sent)!",
        messageId: info.messageId,
        mailJobsCreated: 1,
        simulatedMode: !ENABLE_ACTUAL_SENDING,
        testMode: isTestMode()
      });
    } catch (error) {
      logger.error("❌ Error sending email:", error);
      res.status(500).json({
        message: "Failed to send email.",
        error: error.toString(),
      });
    }
  } catch (error) {
    logger.error("❌ Error creating mail job:", error);
    res.status(500).json({
      message: "Failed to create mail job.",
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
    // Check if sender already exists
    const existingSender = await MailSender.findOne({ email });
    if (existingSender) {
      return res.status(400).json({ 
        message: "Sender already exists.",
        details: {
          email: existingSender.email,
          name: existingSender.name
        }
      });
    }

    // Create a new MailSender document
    const newMailSender = new MailSender({
      email,
      name,
      password,
    });

    // Save the document to the database
    await newMailSender.save();
    
    logger.info(`✅ New mail sender added: ${email}`);
    
    res.status(201).json({ 
      message: "Mail sender added successfully!",
      details: {
        email: newMailSender.email,
        name: newMailSender.name
      }
    });
  } catch (error) {
    logger.error("❌ Error adding mail sender:", error);
    res.status(500).json({ 
      message: "Failed to add mail sender.", 
      error: error.toString() 
    });
  }
};

// Helper function to add a sender if it doesn't exist
const ensureSenderExists = async (email, name, password) => {
  try {
    const existingSender = await MailSender.findOne({ email });
    if (existingSender) {
      logger.info(`✅ Sender already exists: ${email}`);
      return existingSender;
    }

    const newSender = new MailSender({
      email,
      name,
      password
    });

    await newSender.save();
    logger.info(`✅ New sender added: ${email}`);
    return newSender;
  } catch (error) {
    logger.error(`❌ Error ensuring sender exists: ${error}`);
    throw error;
  }
};

module.exports = {
  sendEmail,
  addMailSender,
  ensureSenderExists
};
