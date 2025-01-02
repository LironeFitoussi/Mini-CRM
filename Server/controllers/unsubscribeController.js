const Donator = require("../models/Donator");
const path = require("path");

const unsubscribeEmail = async (req, res) => {
  try {
    const { email } = req.params;

    // Find donators where any of the nested email fields match
    const donators = await Donator.find({
      $or: [
        { "email_1.email": email },
        { "email_2.email": email },
        { "email_3.email": email },
      ],
    });

    // If no matching donators are found
    if (donators.length === 0) {
      return res.status(404).json({ message: "Email not found in records" });
    }

    // Update each donator
    const updates = donators.map((donator) => {
      const update = {};

      if (donator.email_1?.email === email) {
        update["email_1.isSubscribed"] = false; // Update the nested isSubscribed field
      }
      if (donator.email_2?.email === email) {
        update["email_2.isSubscribed"] = false; // Update the nested isSubscribed field
      }
      if (donator.email_3?.email === email) {
        update["email_3.isSubscribed"] = false; // Update the nested isSubscribed field
      }

      // Update the donator in the database
      return Donator.findByIdAndUpdate(
        donator._id,
        { $set: update },
        { new: true }
      );
    });

    // Wait for all updates to complete
    await Promise.all(updates);
    // Render the usnsub html page
    
    res.sendFile(path.join(__dirname, '..', 'public', 'unsub.html'));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { unsubscribeEmail };