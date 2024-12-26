const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const NoteSchema = new Schema({
    note: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    donator: {
        type: Schema.Types.ObjectId,
        ref: 'Donator',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

// Allow virtual fields to be returned in the response
NoteSchema.set('toObject', { virtuals: true });
NoteSchema.set('toJSON', { virtuals: true });

// Virtual field for user
NoteSchema.virtual('userDetails', {
    ref: 'User',
    localField: 'user',
    foreignField: '_id',
    justOne: true
});

NoteSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'userDetails',
        select: 'fName lName'
    });
    next();
});

// Dont Show the user field in the response
NoteSchema.methods.toJSON = function() {
    const note = this;
    const noteObject = note.toObject();

    delete noteObject.user;

    return noteObject;
};

module.exports = mongoose.model('Note', NoteSchema);