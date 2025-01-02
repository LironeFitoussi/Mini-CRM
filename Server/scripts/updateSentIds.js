// updateSentIds.js

require('dotenv').config(); // Load environment variables from .env
const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

// Configuration
const MONGODB_URI = "mongodb+srv://lironefit:4YrMTTViFjGfG0yf@cluster0.e2j9t.mongodb.net/crm-data?retryWrites=true&w=majority&appName=Cluster0"
const DATABASE_NAME = 'phone_data';
const MESSAGES_COLLECTION = 'messages';
const TARGET_DOCUMENT_ID = '6761f89472312e6aad73e6c0'; // Replace with your actual ObjectId

// Path to matching_ids.json
const MATCHING_IDS_PATH = path.join(__dirname, 'matching_ids.json');

// Function to read and parse matching_ids.json
function readMatchingIds(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    const ids = JSON.parse(data);

    if (!Array.isArray(ids)) {
      throw new Error('matching_ids.json does not contain a valid array.');
    }

    return ids.map(id => new ObjectId(id)); // **Use 'new' keyword here**
  } catch (error) {
    console.error(`Error reading or parsing '${filePath}':`, error.message);
    process.exit(1);
  }
}

// Main async function
async function main() {
  try {
    // Check if MONGODB_URI is defined
    if (!MONGODB_URI) {
      console.error('Error: MONGODB_URI is not defined. Please check your .env file.');
      process.exit(1);
    }

    // Check if matching_ids.json exists
    if (!fs.existsSync(MATCHING_IDS_PATH)) {
      console.error(`Error: File '${MATCHING_IDS_PATH}' does not exist.`);
      process.exit(1);
    }

    // Read and parse matching_ids.json
    const matchingIds = readMatchingIds(MATCHING_IDS_PATH);
    console.log(`Loaded ${matchingIds.length} _id values from 'matching_ids.json'.`);

    if (matchingIds.length === 0) {
      console.log('No _id values to insert. Exiting.');
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
    const messagesCollection = db.collection(MESSAGES_COLLECTION);

    // Convert TARGET_DOCUMENT_ID to ObjectId
    let targetDocId;
    try {
      targetDocId = new ObjectId(TARGET_DOCUMENT_ID); // **Use 'new' keyword here as well**
    } catch (err) {
      console.error('Invalid TARGET_DOCUMENT_ID. Must be a valid ObjectId string.');
      process.exit(1);
    }

    // Update the specific document by setting the sent_ids field
    const updateResult = await messagesCollection.updateOne(
      { _id: targetDocId },
      { $set: { sent_ids: matchingIds } } // Use $addToSet: { sent_ids: { $each: matchingIds } } to append without duplicates
    );

    if (updateResult.matchedCount === 0) {
      console.error(`No document found with _id: ${TARGET_DOCUMENT_ID}`);
    } else if (updateResult.modifiedCount === 0) {
      console.log('The sent_ids field was already up-to-date. No changes made.');
    } else {
      console.log(`Successfully updated the sent_ids field of document _id: ${TARGET_DOCUMENT_ID}`);
    }

    // Close the connection
    await client.close();
    console.log('MongoDB connection closed.');
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

// Run the main function
main();
