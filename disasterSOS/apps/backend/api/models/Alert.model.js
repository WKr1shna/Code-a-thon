// Mongoose Schema for Alert
const mongoose = require('mongoose');
const AlertSchema = new mongoose.Schema({
    title: String,
    description: String,
    location: { type: { type: String, default: 'Point' }, coordinates: [Number] },
    severity: String,
    verified: Boolean
});
module.exports = mongoose.model('Alert', AlertSchema);
