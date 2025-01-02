// routes/mailTemplateRoutes.js
const express = require('express');
const router = express.Router();
const mailTemplateController = require('../controllers/mailTemplateController');

// @route   POST /api/mail-templates
// @desc    Create a new MailTemplate
// @access  Public (Modify as needed for authentication)
router.post('/', mailTemplateController.createMailTemplate);

// @route   GET /api/mail-templates
// @desc    Get all MailTemplates
// @access  Public
router.get('/', mailTemplateController.getAllMailTemplates);

// @route   GET /api/mail-templates/:id
// @desc    Get a single MailTemplate by ID
// @access  Public
router.get('/:id', mailTemplateController.getMailTemplateById);

// @route   PUT /api/mail-templates/:id
// @desc    Update a MailTemplate by ID
// @access  Public
router.put('/:id', mailTemplateController.updateMailTemplate);

// @route   DELETE /api/mail-templates/:id
// @desc    Delete a MailTemplate by ID
// @access  Public
router.delete('/:id', mailTemplateController.deleteMailTemplate);

module.exports = router;
