// controllers/mailTemplateController.js
const MailTemplate = require('../models/MailTemplate');

// Create a new MailTemplate
exports.createMailTemplate = async (req, res) => {
    try {
        const { name, subject, body } = req.body;

        // Validate input
        if (!name || !subject || !body) {
            return res.status(400).json({ message: 'Name, subject, and body are required.' });
        }

        // Create and save the new mail template
        const newMailTemplate = new MailTemplate({ name, subject, body });
        const savedTemplate = await newMailTemplate.save();

        res.status(201).json(savedTemplate);
    } catch (error) {
        if (error.code === 11000) { // Duplicate key error
            return res.status(409).json({ message: 'MailTemplate with this name already exists.' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all MailTemplates
exports.getAllMailTemplates = async (req, res) => {
    try {
        const mailTemplates = await MailTemplate.find().sort({ createdAt: -1 });
        res.status(200).json(mailTemplates);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get a single MailTemplate by ID
exports.getMailTemplateById = async (req, res) => {
    try {
        const { id } = req.params;
        const mailTemplate = await MailTemplate.findById(id);

        if (!mailTemplate) {
            return res.status(404).json({ message: 'MailTemplate not found.' });
        }

        res.status(200).json(mailTemplate);
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid MailTemplate ID.' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update a MailTemplate by ID
exports.updateMailTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, subject, body } = req.body;

        // Validate input
        if (!name && !subject && !body) {
            return res.status(400).json({ message: 'At least one field (name, subject, body) must be provided for update.' });
        }

        const updatedFields = {};
        if (name) updatedFields.name = name;
        if (subject) updatedFields.subject = subject;
        if (body) updatedFields.body = body;
        updatedFields.updatedAt = Date.now();

        const updatedMailTemplate = await MailTemplate.findByIdAndUpdate(
            id,
            { $set: updatedFields },
            { new: true, runValidators: true }
        );

        if (!updatedMailTemplate) {
            return res.status(404).json({ message: 'MailTemplate not found.' });
        }

        res.status(200).json(updatedMailTemplate);
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid MailTemplate ID.' });
        }
        if (error.code === 11000) { // Duplicate key error
            return res.status(409).json({ message: 'MailTemplate with this name already exists.' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete a MailTemplate by ID
exports.deleteMailTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedMailTemplate = await MailTemplate.findByIdAndDelete(id);

        if (!deletedMailTemplate) {
            return res.status(404).json({ message: 'MailTemplate not found.' });
        }

        res.status(200).json({ message: 'MailTemplate deleted successfully.' });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid MailTemplate ID.' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
