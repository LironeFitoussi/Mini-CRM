// getIds.js

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// Configuration
const MONGODB_URI = "mongodb+srv://lironefit:4YrMTTViFjGfG0yf@cluster0.e2j9t.mongodb.net/crm-data?retryWrites=true&w=majority&appName=Cluster0";
const DATABASE_NAME = 'phone_data';
const COLLECTIONS = ['valid_numbers']; // Only 'valid_numbers' collection

// Define the paths to your log files
const WHATSAPP_LOG_PATH = path.join(__dirname, '../../Python/send_messages.log'); // Adjust path as needed
const SEND_MESSAGES_LOG_PATH = path.join(__dirname, '../../Python/logs_messages.log'); // Adjust path as needed

// Function to extract phone numbers from whatsapp_logs.txt
function extractPhoneNumbersFromWhatsAppLog(logContent) {
  // Regular expression to match phone numbers in the WhatsApp URL
  const phoneRegex = /https?:\/\/web\.whatsapp\.com\/send\?phone=(\d+)/g;
  const phoneNumbers = new Set();
  let match;

  while ((match = phoneRegex.exec(logContent)) !== null) {
    phoneNumbers.add(match[1]);
  }

  console.log(`Extracted from whatsapp_logs.txt: ${phoneNumbers.size} phone numbers`);
  return Array.from(phoneNumbers);
}

// Function to extract phone numbers from send_messages.log
function extractPhoneNumbersFromSendMessagesLog(logContent) {
  // Regular expressions to match phone numbers in different log formats
  const successRegex = /Image message sent to (\d+)/g;
  const failedRegex = /Failed to send image message to (\d+)/g;
  const phoneNumbers = new Set();
  let match;

  // Extract successful message phone numbers
  while ((match = successRegex.exec(logContent)) !== null) {
    phoneNumbers.add(match[1]);
  }

  // Extract failed message phone numbers
  while ((match = failedRegex.exec(logContent)) !== null) {
    phoneNumbers.add(match[1]);
  }

  console.log(`Extracted from send_messages.log: ${phoneNumbers.size} phone numbers`);
  return Array.from(phoneNumbers);
}

// Main async function
async function main() {
  try {
    // Check if log files exist
    if (!fs.existsSync(WHATSAPP_LOG_PATH)) {
      console.error(`Error: Log file '${WHATSAPP_LOG_PATH}' does not exist.`);
      process.exit(1);
    }

    if (!fs.existsSync(SEND_MESSAGES_LOG_PATH)) {
      console.error(`Error: Log file '${SEND_MESSAGES_LOG_PATH}' does not exist.`);
      process.exit(1);
    }

    // Read the whatsapp_logs.txt file
    const whatsappLogContent = fs.readFileSync(WHATSAPP_LOG_PATH, 'utf-8');
    console.log(`Log file '${WHATSAPP_LOG_PATH}' read successfully.`);

    console.log(whatsappLogContent);
    // Extract phone numbers from whatsapp_logs.txt
    const whatsappPhoneNumbers = extractPhoneNumbersFromWhatsAppLog(whatsappLogContent);
    console.log(`Extracted ${whatsappPhoneNumbers.length} unique phone numbers from 'whatsapp_logs.txt'.`);

    // Read the send_messages.log file
    const sendMessagesLogContent = fs.readFileSync(SEND_MESSAGES_LOG_PATH, 'utf-8');
    console.log(`Log file '${SEND_MESSAGES_LOG_PATH}' read successfully.`);

    // Extract phone numbers from send_messages.log
    const sendMessagesPhoneNumbers = extractPhoneNumbersFromSendMessagesLog(sendMessagesLogContent);
    console.log(`Extracted ${sendMessagesPhoneNumbers.length} unique phone numbers from 'send_messages.log'.`);

    // Combine phone numbers from both logs into a single set to ensure uniqueness
    const allPhoneNumbersSet = new Set([...whatsappPhoneNumbers, ...sendMessagesPhoneNumbers]);
    const allPhoneNumbers = Array.from(allPhoneNumbersSet);
    console.log(`Total unique phone numbers to process: ${allPhoneNumbers.length}.`);

    if (allPhoneNumbers.length === 0) {
      console.log('No phone numbers found in the log files.');
      return;
    }

    // Connect to MongoDB
    const client = new MongoClient(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await client.connect();
    console.log('Connected to MongoDB.');

    const db = client.db(DATABASE_NAME);

    // Prepare a query using $in operator for efficiency
    const query = { phoneNumber: { $in: allPhoneNumbers } };

    // Array to store matching _id values
    const matchingIds = [];

    // Iterate over each collection and fetch matching IDs
    for (const collectionName of COLLECTIONS) {
      const collection = db.collection(collectionName);
      console.log(`Querying collection '${collectionName}'...`);

      const documents = await collection.find(query).project({ _id: 1 }).toArray();

      console.log(`Found ${documents.length} matching documents in '${collectionName}'.`);

      // Extract _id from each document and add to matchingIds array
      documents.forEach(doc => {
        matchingIds.push(doc._id);
      });
    }

    // Remove duplicate _id values if any
    const uniqueMatchingIds = [...new Set(matchingIds)];

    // Output the results
    console.log('Matching IDs:');
    console.log(JSON.stringify(uniqueMatchingIds, null, 2));

    // Optionally, save the results to a file
    const outputPath = path.join(__dirname, 'matching_ids.json');
    fs.writeFileSync(outputPath, JSON.stringify(uniqueMatchingIds, null, 2));
    console.log(`Results saved to '${outputPath}'.`);

    // Close the connection
    await client.close();
    console.log('MongoDB connection closed.');
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

// Run the main function
main();
