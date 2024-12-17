const { MongoClient } = require('mongodb');

async function copyCollection() {
  const uri = "mongodb+srv://lironefit:4YrMTTViFjGfG0yf@cluster0.e2j9t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // Replace with your MongoDB connection string
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const sourceDB = client.db("phone_data");
    const targetDB = client.db("crm-data");

    const sourceCollection = sourceDB.collection("valid_numbers");
    const targetCollection = targetDB.collection("valid_numbers");

    // Fetch all documents from the source collection
    const documents = await sourceCollection.find().toArray();

    // Insert documents into the target collection
    if (documents.length > 0) {
      await targetCollection.insertMany(documents);
      console.log("Collection copied successfully!");
    } else {
      console.log("No documents found in the source collection.");
    }
  } finally {
    await client.close();
  }
}

copyCollection().catch(console.error);
