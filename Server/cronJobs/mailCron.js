// cronJobs/mailCron.js

const cron = require('node-cron');
const nodemailer = require('nodemailer');
const MailJob = require('../models/MailJob');
const MailSender = require('../models/MailSender');
const logger = require('../utils/logger'); // Using a custom logger

// Function to initialize the mail cron job
const initializeMailCronJob = () => {
  // Schedule the cron job to run every day at 08:30 AM
  cron.schedule('30 8 * * 1-5', async () => {
    // cron.schedule('*/30 * * * * *', async () => {
    logger.info(`⏰ Cron job triggered at ${new Date().toLocaleString()}`);

    try {
      // Find the first MailJob that hasn't been sent, ordered by creation date
      const mailJob = await MailJob.findOne({ is_sent: false }).sort({ created_at: 1 });

      if (!mailJob) {
        logger.info('📭 No unsent mail jobs found');
        return;
      }

      logger.info(`📨 Preparing to send mail job: ${mailJob._id}`);

      // Retrieve the MailSender credentials
      const sender = await MailSender.findById(mailJob.sender);
      if (!sender) {
        logger.error(`❌ MailSender with ID ${mailJob.sender} not found.`);
        return;
      }

      // Create a transporter using Gmail
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: sender.email, // Gmail address
          pass: sender.password, // Gmail app password
        },
      });

      // Verify the transporter configuration
      await transporter.verify();
      logger.info('✅ Gmail transporter is ready to send messages');

      // Define email options
      const mailOptions = {
        from: sender.email, // Sender address
        to: mailJob.recipients.join(", "), // List of receivers
        subject: mailJob.subject, // Subject line
        html: mailJob.body, // HTML body
      };

      // Send the email
      const info = await transporter.sendMail(mailOptions);
      console.log(`Prepared to send email to ${mailJob.recipients.join(", ")}`); 
      logger.info(`✅ Email sent: ${info.messageId}`);

      // Update the mail job as sent
      mailJob.is_sent = true;
      await mailJob.save();
      logger.info(`🗂️ Mail job marked as sent: ${mailJob._id}`);

    } catch (error) {
      logger.error(`❌ Error processing mail job: ${error.message}`);
      // Optionally, implement retry logic or log the error for later review
    }
  }, {
    scheduled: true,
    timezone: process.env.TIMEZONE || "UTC" // Use timezone from .env or default to UTC
  });

  logger.info('🕒 Mail cron job scheduled to run daily at 08:30 AM');
};

module.exports = initializeMailCronJob;
