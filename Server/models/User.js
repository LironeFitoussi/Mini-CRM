const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    fName: {
        type: String,
        required: true
    },
    lName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['developer', 'admin', 'user', 'guest'],
        default: 'guest'    
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Allow virtual fields to be returned in the response
UserSchema.set('toObject', { virtuals: true });
UserSchema.set('toJSON', { virtuals: true });

// UserSchema.pre(/^find/, function(next) {
//     this.populate('notes');
//     next();
// });

module.exports = mongoose.model('User', UserSchema);