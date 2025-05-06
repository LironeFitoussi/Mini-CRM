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

// Function to split recipients into batches
const splitIntoBatches = (recipients) => {
  const batches = [];
  for (let i = 0; i < recipients.length; i += MAX_RECIPIENTS_PER_EMAIL) {
    batches.push(recipients.slice(i, i + MAX_RECIPIENTS_PER_EMAIL));
  }
  return batches;
};

// Email sending controller
const sendEmail = async (req, res) => {
  const { from, to, subject, body, imageUrl, imageLink, isImageClickable, clickableImageText } = req.body;

  // Basic validation
  if (!from || !to || !subject || !body) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Get the sender's email from the database
    const sender = await MailSender.findOne({ email: from });

    if (!sender) {
      const allSenders = await MailSender.find({}, { email: 1, _id: 0 });
      logger.error(`❌ Sender not found. Available senders: ${JSON.stringify(allSenders)}`);
      return res.status(404).json({ 
        message: "Sender not found.",
        details: {
          searchedEmail: from,
          availableSenders: allSenders
        }
      });
    }

    // Ensure 'to' is an array and remove any duplicates
    const recipients = Array.isArray(to) ? [...new Set(to)] : [to];

    // Split recipients into batches of MAX_RECIPIENTS_PER_EMAIL
    const recipientBatches = splitIntoBatches(recipients);
    
    // Create a mail job for tracking
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

    await mailJob.save();

    // Create transporter (if not in test mode)
    const transporter = process.env.NODE_ENV !== 'test' ? nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: sender.email,
        pass: sender.password,
      },
      tls: {
        rejectUnauthorized: false
      }
    }) : null;

    // If not in test mode, verify the connection
    if (process.env.NODE_ENV !== 'test' && transporter) {
      await transporter.verify();
      logger.info("✅ SMTP server is ready to take our messages");
    }

    const successfulRecipients = [];
    const failedRecipients = [];

    // Send emails in batches
    for (const batch of recipientBatches) {
      const mailOptions = {
        from: `Rav Benyamin Chemouny <${sender.email}>`,
        to: sender.email,
        bcc: batch,
        subject,
        html: mailJob.body,
      };

      try {
        if (process.env.NODE_ENV === 'test') {
          // Simulate sending in test mode
          logger.info(`✅ SIMULATED EMAIL - Batch of ${batch.length} recipients`);
          successfulRecipients.push(...batch);
          await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for simulation
        } else {
          // Actually send the email
          const info = await transporter.sendMail(mailOptions);
          logger.info(`✅ Batch sent successfully: ${info.messageId}`);
          successfulRecipients.push(...batch);
        }
      } catch (error) {
        logger.error(`❌ Error sending batch: ${error.message}`);
        failedRecipients.push(...batch.map(email => ({ email, error: error.message })));
      }
    }

    // Update the mail job with results
    mailJob.is_sent = true;
    mailJob.successful_recipients = successfulRecipients;
    mailJob.failed_recipients = failedRecipients;
    await mailJob.save();

    // Send response
    res.status(200).json({
      message: process.env.NODE_ENV === 'test' ? 
        "Email simulated successfully!" : 
        "Email sent successfully!",
      totalRecipients: recipients.length,
      successfulRecipients: successfulRecipients.length,
      failedRecipients: failedRecipients.length,
      batches: recipientBatches.length
    });

  } catch (error) {
    logger.error("❌ Error in email sending process:", error);
    res.status(500).json({
      message: "Failed to process email sending.",
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
