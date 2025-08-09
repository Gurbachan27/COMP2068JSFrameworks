const mongoose = require('mongoose');

module.exports = function() {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error('MONGO_URI not set in environment');
        process.exit(1);
    }
    mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log('MongoDB connected');
    }).catch(err => {
        console.error('MongoDB connect error:', err);
        process.exit(1);
    });
};