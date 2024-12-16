const { MongoClient } = require('mongodb');

(async function() {
  // Update this with your actual connection URI and options
  const uri = 'mongodb+srv://duplico:FkGItKAZKPS0NIuC@cluster0.e2j9t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
  const dbName = 'phone_data';
  const collectionName = 'valid_numbers';

  let client;
  try {
    // Connect to MongoDB
    client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Delete all documents where is_whatsapp = "unknown"
    const result = await collection.deleteMany({ is_whatsapp: 'unknown' });
    console.log(`Deleted ${result.deletedCount} documents with is_whatsapp set to "unknown".`);

  } catch (err) {
    console.error('An error occurred:', err);
  } finally {
    if (client) {
      await client.close();
      console.log('Connection closed.');
    }
  }
})();
