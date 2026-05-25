// Mongoose Schema for Resource
const mongoose = require('mongoose');
const ResourceSchema = new mongoose.Schema({
    name: String,
    type: String,
    availableQuantity: Number,
    location: { type: { type: String, default: 'Point' }, coordinates: [Number] }
});
module.exports = mongoose.model('Resource', ResourceSchema);
