const mongoose = require("mongoose");
const readline = require("readline");
const dotenv = require("dotenv");
const Donor = require("../models/Donor");
const Donation = require("../models/Donation");
const Note = require("../models/Note");
const Notification = require("../models/Notification");

dotenv.config();

// Setup readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    const dbURI = process.env.MONGODB_URI || "mongodb+srv://lironefit:4YrMTTViFjGfG0yf@cluster0.e2j9t.mongodb.net/crm-data?retryWrites=true&w=majority&appName=Cluster0";
    await mongoose.connect(dbURI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

// Function to prompt for donor IDs
const promptForDonorIds = () => {
  return new Promise((resolve) => {
    rl.question("Enter source donor ID (this donor will be merged into the target): ", (sourceDonorId) => {
      rl.question("Enter target donor ID (this donor will receive all data from source): ", (targetDonorId) => {
        resolve({ sourceDonorId, targetDonorId });
      });
    });
  });
};

// Function to confirm the merge
const confirmMerge = (sourceDonor, targetDonor) => {
  return new Promise((resolve) => {
    console.log("\n📌 DONOR MERGE CONFIRMATION:");
    console.log("Source donor (will be removed after merge):");
    console.log(`- ID: ${sourceDonor._id}`);
    console.log(`- Name: ${sourceDonor.fName} ${sourceDonor.lName}`);
    console.log(`- Status: ${sourceDonor.status}`);
    
    console.log("\nTarget donor (will contain merged data):");
    console.log(`- ID: ${targetDonor._id}`);
    console.log(`- Name: ${targetDonor.fName} ${targetDonor.lName}`);
    console.log(`- Status: ${targetDonor.status}`);
    
    rl.question("\nAre you sure you want to merge these donors? (yes/no): ", (answer) => {
      resolve(answer.toLowerCase() === "yes");
    });
  });
};

// Function to merge donor data
const mergeDonorData = (sourceDonor, targetDonor) => {
  // Create a new object for the updated target donor
  const updatedTargetDonor = { ...targetDonor._doc || targetDonor };
  
  // Merge platform IDs
  if (sourceDonor.allo_dons_id && sourceDonor.allo_dons_id.length > 0) {
    updatedTargetDonor.allo_dons_id = [
      ...(targetDonor.allo_dons_id || []),
      ...sourceDonor.allo_dons_id
    ].filter((id, index, self) => self.indexOf(id) === index); // Remove duplicates
  }
  
  if (sourceDonor.nedarim_id && sourceDonor.nedarim_id.length > 0) {
    updatedTargetDonor.nedarim_id = [
      ...(targetDonor.nedarim_id || []),
      ...sourceDonor.nedarim_id
    ].filter((id, index, self) => self.indexOf(id) === index); // Remove duplicates
  }
  
  // Merge platform types
  if (sourceDonor.platform_type && sourceDonor.platform_type.length > 0) {
    updatedTargetDonor.platform_type = [
      ...(targetDonor.platform_type || []),
      ...sourceDonor.platform_type
    ].filter((type, index, self) => self.indexOf(type) === index); // Remove duplicates
  }
  
  // Merge emails (check for empty slots in target donor)
  const targetEmails = [];
  
  // Collect existing target emails
  for (let i = 1; i <= 3; i++) {
    const targetEmailKey = `email_${i}`;
    if (targetDonor[targetEmailKey] && targetDonor[targetEmailKey].email) {
      targetEmails.push(targetDonor[targetEmailKey].email);
    }
  }
  
  // Process source emails
  for (let i = 1; i <= 3; i++) {
    const sourceEmailKey = `email_${i}`;
    if (sourceDonor[sourceEmailKey] && sourceDonor[sourceEmailKey].email) {
      // Check if this email already exists in target emails
      if (!targetEmails.includes(sourceDonor[sourceEmailKey].email)) {
        // Find the first empty slot
        let emptySlotFound = false;
        for (let j = 1; j <= 3; j++) {
          const targetEmailKey = `email_${j}`;
          if (!updatedTargetDonor[targetEmailKey] || !updatedTargetDonor[targetEmailKey].email) {
            updatedTargetDonor[targetEmailKey] = { ...sourceDonor[sourceEmailKey] };
            targetEmails.push(sourceDonor[sourceEmailKey].email);
            emptySlotFound = true;
            break;
          }
        }
        
        // If no empty slot found and this is an important email, override the third slot
        if (!emptySlotFound && i === 1 && !targetEmails.includes(sourceDonor[sourceEmailKey].email)) {
          updatedTargetDonor.email_3 = { ...sourceDonor[sourceEmailKey] };
          console.log(`⚠️ Overrode email_3 with source's primary email: ${sourceDonor[sourceEmailKey].email}`);
        }
      }
    }
  }
  
  // Merge phone numbers
  const targetPhones = [];
  
  // Collect existing target phones
  for (let i = 1; i <= 3; i++) {
    const targetPhoneKey = `phone_number_${i}`;
    if (targetDonor[targetPhoneKey] && targetDonor[targetPhoneKey].number) {
      targetPhones.push(targetDonor[targetPhoneKey].number);
    }
  }
  
  // Process source phones
  for (let i = 1; i <= 3; i++) {
    const sourcePhoneKey = `phone_number_${i}`;
    if (sourceDonor[sourcePhoneKey] && sourceDonor[sourcePhoneKey].number) {
      // Check if this phone already exists in target phones
      if (!targetPhones.includes(sourceDonor[sourcePhoneKey].number)) {
        // Find the first empty slot
        let emptySlotFound = false;
        for (let j = 1; j <= 3; j++) {
          const targetPhoneKey = `phone_number_${j}`;
          if (!updatedTargetDonor[targetPhoneKey] || !updatedTargetDonor[targetPhoneKey].number) {
            updatedTargetDonor[targetPhoneKey] = { ...sourceDonor[sourcePhoneKey] };
            targetPhones.push(sourceDonor[sourcePhoneKey].number);
            emptySlotFound = true;
            break;
          }
        }
        
        // If no empty slot found and this is an important phone, override the third slot
        if (!emptySlotFound && i === 1 && !targetPhones.includes(sourceDonor[sourcePhoneKey].number)) {
          updatedTargetDonor.phone_number_3 = { ...sourceDonor[sourcePhoneKey] };
          console.log(`⚠️ Overrode phone_number_3 with source's primary phone: ${sourceDonor[sourcePhoneKey].number}`);
        }
      }
    }
  }
  
  // Use source metadata if target doesn't have it
  if (!targetDonor.birthdate && sourceDonor.birthdate) {
    updatedTargetDonor.birthdate = sourceDonor.birthdate;
  }
  
  // If target has no status or its status is "To Contact" but source has a more specific status
  if ((!targetDonor.status || targetDonor.status === "To Contact") && 
      sourceDonor.status && sourceDonor.status !== "To Contact") {
    updatedTargetDonor.status = sourceDonor.status;
    console.log(`ℹ️ Updated status from '${targetDonor.status || "none"}' to '${sourceDonor.status}'`);
  }
  
  // If target has no owner but source does, use source's owner
  if (!targetDonor.owner && sourceDonor.owner) {
    updatedTargetDonor.owner = sourceDonor.owner;
    console.log(`ℹ️ Assigned owner from source donor`);
  }
  
  return updatedTargetDonor;
};

// Main function to merge donors
const mergeDonors = async () => {
  try {
    await connectDB();
    
    const { sourceDonorId, targetDonorId } = await promptForDonorIds();
    
    // Validate that IDs are different
    if (sourceDonorId === targetDonorId) {
      console.error("❌ Error: Source and target donor IDs cannot be the same");
      return;
    }
    
    // Fetch donors
    const sourceDonor = await Donor.findById(sourceDonorId);
    const targetDonor = await Donor.findById(targetDonorId);
    
    // Validate that both donors exist
    if (!sourceDonor) {
      console.error(`❌ Error: Source donor with ID ${sourceDonorId} not found`);
      return;
    }
    
    if (!targetDonor) {
      console.error(`❌ Error: Target donor with ID ${targetDonorId} not found`);
      return;
    }
    
    // Log detailed donor information before merge
    console.log("\n📊 SOURCE DONOR DETAILS:");
    console.log(`- ID: ${sourceDonor._id}`);
    console.log(`- Name: ${sourceDonor.fName} ${sourceDonor.lName}`);
    console.log(`- Allodon IDs: ${JSON.stringify(sourceDonor.allo_dons_id || [])}`);
    console.log(`- Nedarim IDs: ${JSON.stringify(sourceDonor.nedarim_id || [])}`);
    console.log(`- Platform Types: ${JSON.stringify(sourceDonor.platform_type || [])}`);
    console.log(`- Emails: ${getEmailSummary(sourceDonor)}`);
    console.log(`- Phones: ${getPhoneSummary(sourceDonor)}`);
    console.log(`- Status: ${sourceDonor.status || "None"}`);
    
    console.log("\n📊 TARGET DONOR DETAILS (BEFORE MERGE):");
    console.log(`- ID: ${targetDonor._id}`);
    console.log(`- Name: ${targetDonor.fName} ${targetDonor.lName}`);
    console.log(`- Allodon IDs: ${JSON.stringify(targetDonor.allo_dons_id || [])}`);
    console.log(`- Nedarim IDs: ${JSON.stringify(targetDonor.nedarim_id || [])}`);
    console.log(`- Platform Types: ${JSON.stringify(targetDonor.platform_type || [])}`);
    console.log(`- Emails: ${getEmailSummary(targetDonor)}`);
    console.log(`- Phones: ${getPhoneSummary(targetDonor)}`);
    console.log(`- Status: ${targetDonor.status || "None"}`);
    
    // Confirm merge
    const confirmed = await confirmMerge(sourceDonor, targetDonor);
    if (!confirmed) {
      console.log("❌ Merge cancelled");
      return;
    }
    
    console.log("🔄 Starting merge process...");
    
    // Begin transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // 1. Merge donor data
      const updatedTargetDonor = mergeDonorData(sourceDonor, targetDonor);
      
      // Log the merged donor data before update
      console.log("\n📊 MERGED DONOR DATA (BEFORE UPDATE):");
      console.log(`- ID: ${updatedTargetDonor._id}`);
      console.log(`- Name: ${updatedTargetDonor.fName} ${updatedTargetDonor.lName}`);
      console.log(`- Allodon IDs: ${JSON.stringify(updatedTargetDonor.allo_dons_id || [])}`);
      console.log(`- Nedarim IDs: ${JSON.stringify(updatedTargetDonor.nedarim_id || [])}`);
      console.log(`- Platform Types: ${JSON.stringify(updatedTargetDonor.platform_type || [])}`);
      console.log(`- Emails: ${getEmailSummary(updatedTargetDonor)}`);
      console.log(`- Phones: ${getPhoneSummary(updatedTargetDonor)}`);
      console.log(`- Status: ${updatedTargetDonor.status || "None"}`);
      
      // 2. Update the target donor - using direct MongoDB update for reliability
      console.log("🔄 Updating target donor with merged data...");
      
      // Remove Mongoose-specific properties before update
      const updateData = { ...updatedTargetDonor };
      delete updateData._id;
      delete updateData.__v;
      delete updateData.createdAt;
      delete updateData.updatedAt;
      delete updateData.donations;
      delete updateData.tasks;
      delete updateData.notes;
      delete updateData.ownerDetails;
      delete updateData.nextContactDate;
      
      // Update with MongoDB native driver to bypass Mongoose hooks and virtuals
      const updateResult = await mongoose.connection.db.collection('donors').updateOne(
        { _id: new mongoose.Types.ObjectId(targetDonorId) },
        { $set: updateData },
        { session }
      );
      
      if (updateResult.modifiedCount === 1) {
        console.log("✅ Donor information merged successfully");
      } else {
        console.warn(`⚠️ Donor update operation reported ${updateResult.modifiedCount} modified documents`);
      }
      
      // 3. Update all donations from source donor to target donor
      const donationResult = await Donation.updateMany(
        { donator_id: sourceDonorId },
        { donator_id: targetDonorId },
        { session }
      );
      console.log(`✅ ${donationResult.modifiedCount} donations transferred to target donor`);
      
      // 4. Update all notes from source donor to target donor
      const noteResult = await Note.updateMany(
        { donator: sourceDonorId },
        { donator: targetDonorId },
        { session }
      );
      console.log(`✅ ${noteResult.modifiedCount} notes transferred to target donor`);
      
      // 5. Update all notifications from source donor to target donor
      const notificationResult = await Notification.updateMany(
        { donatorId: sourceDonorId },
        { donatorId: targetDonorId },
        { session }
      );
      console.log(`✅ ${notificationResult.modifiedCount} notifications transferred to target donor`);
      
      // 6. Delete the source donor - use MongoDB native driver for reliability
      const deleteResult = await mongoose.connection.db.collection('donors').deleteOne(
        { _id: new mongoose.Types.ObjectId(sourceDonorId) },
        { session }
      );
      
      if (deleteResult.deletedCount === 1) {
        console.log("✅ Source donor deleted successfully");
      } else {
        console.warn(`⚠️ Source donor deletion reported ${deleteResult.deletedCount} deleted documents`);
      }
      
      // Commit the transaction
      await session.commitTransaction();
      console.log("✅ Transaction committed successfully");
      
      // Verify the merge was successful by fetching the updated donor
      const finalTargetDonor = await Donor.findById(targetDonorId);
      
      console.log("\n📊 TARGET DONOR DETAILS (AFTER MERGE):");
      console.log(`- ID: ${finalTargetDonor._id}`);
      console.log(`- Name: ${finalTargetDonor.fName} ${finalTargetDonor.lName}`);
      console.log(`- Allodon IDs: ${JSON.stringify(finalTargetDonor.allo_dons_id || [])}`);
      console.log(`- Nedarim IDs: ${JSON.stringify(finalTargetDonor.nedarim_id || [])}`);
      console.log(`- Platform Types: ${JSON.stringify(finalTargetDonor.platform_type || [])}`);
      console.log(`- Emails: ${getEmailSummary(finalTargetDonor)}`);
      console.log(`- Phones: ${getPhoneSummary(finalTargetDonor)}`);
      console.log(`- Status: ${finalTargetDonor.status || "None"}`);
      
      console.log(`🎉 Donors successfully merged! All data now belongs to donor ${targetDonorId}`);
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      console.error("❌ Transaction aborted:", error);
      throw error;
    } finally {
      // End session
      session.endSession();
    }
  } catch (error) {
    console.error("❌ Error during merge process:", error);
  } finally {
    // Close the readline interface
    rl.close();
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
  }
};

// Helper function to format email summary
const getEmailSummary = (donor) => {
  let emails = [];
  for (let i = 1; i <= 3; i++) {
    const emailKey = `email_${i}`;
    if (donor[emailKey] && donor[emailKey].email) {
      emails.push(`${emailKey}: ${donor[emailKey].email}`);
    }
  }
  return emails.length > 0 ? emails.join(", ") : "None";
};

// Helper function to format phone summary
const getPhoneSummary = (donor) => {
  let phones = [];
  for (let i = 1; i <= 3; i++) {
    const phoneKey = `phone_number_${i}`;
    if (donor[phoneKey] && donor[phoneKey].number) {
      phones.push(`${phoneKey}: ${donor[phoneKey].number}`);
    }
  }
  return phones.length > 0 ? phones.join(", ") : "None";
};

// Execute if run directly
if (require.main === module) {
  mergeDonors()
    .then(() => {
      console.log("✨ Script completed");
    })
    .catch(error => {
      console.error("❌ Script failed:", error);
      process.exit(1);
    });
}

module.exports = { mergeDonors };
