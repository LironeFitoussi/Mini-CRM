const mongoose = require('mongoose');

(async function() {
  // Update with your MongoDB connection string
  const uri = 'mongodb+srv://duplico:FkGItKAZKPS0NIuC@cluster0.e2j9t.mongodb.net/phone_data?retryWrites=true&w=majority&appName=Cluster0';

  try {
    // Connect to Mongoose
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB via Mongoose');

    // Define a Mongoose model for the valid_numbers collection
    const validNumberSchema = new mongoose.Schema({
      phoneNumber: { type: String, required: true },
      // Include other fields as needed
    }, { collection: 'valid_numbers' });

    const ValidNumber = mongoose.model('ValidNumber', validNumberSchema);

    // Aggregate to find duplicates
    const duplicates = await ValidNumber.aggregate([
      {
        $group: {
          _id: "$phoneNumber",
          ids: { $push: "$_id" },
          count: { $sum: 1 }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);

    if (duplicates.length === 0) {
      console.log('No duplicates found.');
      return;
    }

    console.log(`Found ${duplicates.length} sets of duplicate phoneNumbers. Removing duplicates...`);

    // Remove duplicates, keeping one per phoneNumber
    for (const duplicate of duplicates) {
      const { ids } = duplicate;
      // Keep the first document in the array, remove the rest
      const [keep, ...removeIds] = ids;
      if (removeIds.length > 0) {
        const result = await ValidNumber.deleteMany({ _id: { $in: removeIds } });
        console.log(`For phoneNumber "${duplicate._id}", removed ${result.deletedCount} duplicate(s).`);
      }
    }

    console.log('Duplicate cleanup complete.');
  } catch (err) {
    console.error('An error occurred:', err);
  } finally {
    // Close the Mongoose connection
    await mongoose.connection.close();
  }
})();
