const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    message: {
        type: String,
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'error', 'success', "callback"], // Example types
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    donatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donator',
    },
    archived: {
        type: Boolean,
        default: false,
    },
    notificationDate: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Allow virtual fields to be returned in the API response
notificationSchema.set('toObject', { virtuals: true });
notificationSchema.set('toJSON', { virtuals: true });

// User Virtual Field
notificationSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true,
});

// Donator Virtual Field
notificationSchema.virtual('donator', {
    ref: 'Donator',
    localField: 'donatorId',
    foreignField: '_id',
    justOne: true,
});

module.exports = mongoose.model('Notification', notificationSchema);
