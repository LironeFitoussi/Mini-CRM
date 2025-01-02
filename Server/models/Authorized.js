const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const authorizedSchema = new Schema({
    users: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Authorized', authorizedSchema);