// Mongoose Schema for User
const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: { type: String, enum: ['CITIZEN', 'SUPERVISOR', 'RESPONDER', 'ADMIN'] }
});
module.exports = mongoose.model('User', UserSchema);
