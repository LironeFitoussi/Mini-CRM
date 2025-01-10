const express = require('express');
const notificationController = require('../controllers/notificationController.js');

const router = express.Router();

// Get all notifications
router.get('/', notificationController.getAllNotifications);

// Get all notifications for a specific user
router.get('/user/:userId', notificationController.getUsersNotifications);

// Get all notifications for a specific donor
router.get('/donor/:donorId', notificationController.getDonorsNotifications);

// Get all notifications for a specific user that are older than today
router.get('/user/:userId/day', notificationController.getUsersDayNotifications);

// Get a single notification by ID
router.get('/:id', notificationController.getNotificationById);

// Create a new notification
router.post('/', notificationController.createNotification);

// Set a notification as read
router.patch('/:id', notificationController.setNotificationAsRead);

// Update a notification by ID
router.put('/:id', notificationController.updateNotification);

// Delete a notification by ID
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;