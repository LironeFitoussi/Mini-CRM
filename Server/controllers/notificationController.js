const Notification = require("../models/Notification");

// Get all notifications
exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).populate('user').populate('donator');
    
    console.log(notifications);
    
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// Get a single notification by ID
exports.getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch the notification" });
  }
};

// Get Users Notifications
exports.getUsersNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    }).populate('user').populate('donator');
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// Get Users Day Notifications
// (all notifications that notificationDate is befre today)
exports.getUsersDayNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({
      userId,
      notificationDate: { $lt: new Date() },
    }).sort({ createdAt: -1 }).populate('user').populate('donator');
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// Create a new notification
exports.createNotification = async (req, res) => {
  try {
    const { title, message, type, userId, notificationDate } = req.body;
    const newNotification = new Notification({
      title,
      message,
      type,
      userId,
      notificationDate,
    });
    await newNotification.save();
    res.status(201).json(newNotification);
  } catch (error) {
    res.status(500).json({ error: "Failed to create the notification" });
  }
};

// Update a notification by ID
exports.updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, type, isRead } = req.body;
    const updatedNotification = await Notification.findByIdAndUpdate(
      id,
      { title, message, type, isRead },
      { new: true, runValidators: true }
    );
    if (!updatedNotification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.status(200).json(updatedNotification);
  } catch (error) {
    res.status(500).json({ error: "Failed to update the notification" });
  }
};

// Set Notification as Read
exports.setNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true, runValidators: true }
    );
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ error: "Failed to update the notification" });
  }
};

// Delete a notification by ID
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedNotification = await Notification.findByIdAndDelete(id);
    if (!deletedNotification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete the notification" });
  }
};
