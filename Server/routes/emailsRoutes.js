const express = require('express');
const emailController = require('../controllers/emailController.js');

const router = express.Router();

// Define routes
router.post('/', emailController.sendEmail);
router.post('/add', emailController.addMailSender);

module.exports = router;