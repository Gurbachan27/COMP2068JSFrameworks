const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String },
    status: { type: String, enum: ['lost', 'found'], default: 'lost' },
    image: { type: String }, // optional filename if you later add file uploads
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', PostSchema);