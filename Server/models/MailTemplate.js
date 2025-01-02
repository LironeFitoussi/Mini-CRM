const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MailTemplateSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    subject: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    imagePosition: {
        type: String,
        enum: ['top', 'bottom'],
        default: 'top'
    },
    imageUrl: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

MailTemplateSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('MailTemplate', MailTemplateSchema);