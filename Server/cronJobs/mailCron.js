// cronJobs/mailCron.js

const cron = require('node-cron');
const nodemailer = require('nodemailer');
const MailJob = require('../models/MailJob');
const MailSender = require('../models/MailSender');
const logger = require('../utils/logger'); // Using a custom logger

// Flag to enable/disable actual email sending (set to false for testing)
const ENABLE_ACTUAL_SENDING = process.env.DEV_MODE === "true" ? false : true;

// Helper function to pause execution for a specified time
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

      // Track successful and failed recipients
      const successfulRecipients = [];
      const failedRecipients = [];
      
      let transporter;
      
      if (ENABLE_ACTUAL_SENDING) {
        // Create a transporter using Gmail
        transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: sender.email, // Gmail address
            pass: sender.password, // Gmail app password
          },
        });

        // Verify the transporter configuration
        await transporter.verify();
        logger.info('✅ Gmail transporter is ready to send messages');
      } else {
        logger.info('✅ SIMULATION MODE: No actual emails will be sent');
      }
      
      // Send individual emails to each recipient
      for (let i = 0; i < mailJob.recipients.length; i++) {
        const recipient = mailJob.recipients[i];
        
        try {
          // Define email options for a single recipient
          const mailOptions = {
            from: `Rav Benyamin Chemouny <${sender.email}>`,
            to: recipient, // Single recipient
            subject: mailJob.subject, // Subject line
            html: mailJob.body, // HTML body
          };

          if (ENABLE_ACTUAL_SENDING) {
            // Send the email
            const info = await transporter.sendMail(mailOptions);
            logger.info(`✅ Email sent to ${recipient}: ${info.messageId}`);
          } else {
            // Simulate email sending
            const simulatedInfo = {
              messageId: `simulated-cron-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
            };
            logger.info(`✅ SIMULATED EMAIL (CRON) - Not actually sent to ${recipient}`);
            logger.info(`📧 From: ${mailOptions.from}`);
            logger.info(`📧 To: ${recipient}`);
            logger.info(`📧 Subject: ${mailOptions.subject}`);
            logger.info(`✅ Simulated message ID: ${simulatedInfo.messageId}`);
            
            // Add a small delay to simulate actual sending time
            await sleep(100); // Shorter delay for simulation
          }
          
          successfulRecipients.push(recipient);
          
          // If not the last recipient, pause to avoid hitting rate limits
          // Only pause if there are more emails to send
          if (i < mailJob.recipients.length - 1) {
            // Add a small pause between each email to avoid triggering spam filters
            if (ENABLE_ACTUAL_SENDING) {
              await sleep(5000); // 5 second pause between emails
              
              // After every 20 emails, pause for 2 minutes to avoid rate limits
              if ((i + 1) % 20 === 0) {
                logger.info(`⏸️ Pausing for 2 minutes after sending ${i + 1} emails to avoid rate limits`);
                await sleep(120000); // 2 minute pause (120,000 ms)
              }
            } else {
              // Shorter pauses in simulation mode
              await sleep(100); // 100ms pause between simulated emails
              
              // After every 20 emails, pause for 1 second in simulation mode
              if ((i + 1) % 20 === 0) {
                logger.info(`⏸️ Simulation: Short pause after processing ${i + 1} emails`);
                await sleep(1000); // 1 second pause in simulation mode
              }
            }
          }
        } catch (error) {
          logger.error(`❌ Error sending email to ${recipient}: ${error.message}`);
          failedRecipients.push({ email: recipient, error: error.message });
          
          // If we hit a rate limit or too many requests error, pause for 2 minutes
          if (ENABLE_ACTUAL_SENDING && 
            (error.message.includes('rate limit') || 
            error.message.includes('too many') || 
            error.message.includes('450') ||
            error.message.includes('421') ||
            error.message.includes('throttled'))
          ) {
            logger.info(`⏸️ Rate limit detected. Pausing for 2 minutes before continuing`);
            await sleep(120000); // 2 minute pause (120,000 ms)
          }
        }
      }

      // Update the mail job status
      mailJob.is_sent = true;
      mailJob.successful_recipients = successfulRecipients;
      mailJob.failed_recipients = failedRecipients;
      await mailJob.save();
      
      // Log summary
      logger.info(`🗂️ Mail job completed: ${mailJob._id}`);
      logger.info(`📊 Summary: ${successfulRecipients.length} emails sent successfully, ${failedRecipients.length} failed`);
      logger.info(`📊 Mode: ${ENABLE_ACTUAL_SENDING ? 'ACTUAL SENDING' : 'SIMULATION (no emails actually sent)'}`);
      
      // If there were failures, log them for review
      if (failedRecipients.length > 0) {
        logger.error(`❌ Failed recipients: ${JSON.stringify(failedRecipients)}`);
      }

    } catch (error) {
      logger.error(`❌ Error processing mail job: ${error.message}`);
      // Optionally, implement retry logic or log the error for later review
    }
  }, {
    scheduled: true,
    timezone: process.env.TIMEZONE || "UTC" // Use timezone from .env or default to UTC
  });

  logger.info('🕒 Mail cron job scheduled to run daily at 08:30 AM');
  logger.info(`🔧 Email sending mode: ${ENABLE_ACTUAL_SENDING ? 'ACTUAL SENDING' : 'SIMULATION (no emails will be sent)'}`);
};

module.exports = initializeMailCronJob;
