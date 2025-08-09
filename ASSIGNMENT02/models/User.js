const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    githubId: {
        type: String,
        required: false,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: false,
        unique: true,
        sparse: true // allow multiple nulls
    },
    password: {
        type: String,
        required: false,
    }
});

module.exports = mongoose.model('User', UserSchema);