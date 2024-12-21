const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TaksSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    donator: {
        type: Schema.Types.ObjectId,
        ref: 'Donator',
        // required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Taks', TaksSchema);