const Contact = require("../models/Contact");


// Get all contacts
exports.getAllContacts = async (req, res) => {
  try {
    const { query } = req;

    // Extract pagination parameters from query
    const page = parseInt(query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(query.limit) || 10; // Default to 10 items per page if not provided
    const skip = (page - 1) * limit;

    // console.log("params", query);

    // Fetch valid_numbers collection (query) from the database (MongoDB) with pagination
    const contacts = await Contact.find().skip(skip).limit(limit);

    // Get total count of documents
    const totalDocuments = await Contact.countDocuments();

    // console.log(totalDocuments);

    // Send the paginated data and metadata as a response
    res.status(200).json({
      currentPage: page,
      totalPages: Math.ceil(totalDocuments / limit),
      totalDocuments,
      contacts,
    });
  } catch (error) {
    console.error("Error fetching contacts:", {
      message: error.message,
      stack: error.stack,
    });

    // Send a response if there's an error
    res
      .status(500)
      .json({ error: "Failed to fetch contacts", details: error.message });
  }
};

// Get a single contact by ID
exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new contact
exports.createContact = async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an existing contact
exports.updateContact = async (req, res) => {
  try {
    const updateContact = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updateContact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(200).json(updateContact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a contact
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bulk create contacts
// http://localhost:3000/api/v1/contacts/bulk-create?namecol&phonecol&mailcal

