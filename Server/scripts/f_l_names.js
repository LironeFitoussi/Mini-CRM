const { MongoClient } = require('mongodb');
require('dotenv').config(); // Ensure you have dotenv installed and your .env file is correctly set up

// Access the MongoDB URI from the environment variable
const uri = process.env.MONGO_URI;

// Replace with your database and collection names
const dbName = "crm-data"; // Replace with your database name
const collectionName = "donors"; // Replace with your collection name

(async function fixNames() {
  if (!uri) {
    console.error("Error: MONGO_URI is not defined in the environment variables.");
    process.exit(1);
  }

  const client = new MongoClient(uri, { useUnifiedTopology: true });

  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log("Connected to the database");

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Update each document to swap `fName` and `lName`
    const result = await collection.updateMany(
      {}, // Empty filter matches all documents
      [
        {
          $set: {
            fName: "$lName",
            lName: "$fName",
          },
        },
      ]
    );

    console.log(`${result.modifiedCount} documents updated successfully`);
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    // Close the database connection
    await client.close();
    console.log("Database connection closed");
  }
})();
