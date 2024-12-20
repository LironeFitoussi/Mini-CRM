const { MongoClient } = require('mongodb');

// Replace the placeholder values with your actual connection string details
const uri = "mongodb+srv://duplico:FkGItKAZKPS0NIuC@cluster0.e2j9t.mongodb.net/phone_data?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  const client = new MongoClient(uri, { useUnifiedTopology: true });

  try {
    // Connect to the MongoDB Atlas cluster
    await client.connect();

    // Specify the database and collection
    const database = client.db('phone_data');
    const collection = database.collection('messages');

    // Find all documents in the messages collection
    const cursor = collection.find({});

    // Convert the cursor into an array of documents
    const allDocs = await cursor.toArray();

    // Print the retrieved documents
    console.log("All documents from 'messages' collection:");
    console.log(allDocs);
  } catch (err) {
    console.error("Error connecting to the database or fetching documents:", err);
  } finally {
    // Close the database connection
    await client.close();
  }
}

// Run the function
run().catch(console.dir);
