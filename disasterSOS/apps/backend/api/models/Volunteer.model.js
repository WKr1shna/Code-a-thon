// Mongoose Schema for Volunteer
const mongoose = require('mongoose');
const VolunteerSchema = new mongoose.Schema({
    userId: String,
    skills: [String],
    active: Boolean
});
module.exports = mongoose.model('Volunteer', VolunteerSchema);
